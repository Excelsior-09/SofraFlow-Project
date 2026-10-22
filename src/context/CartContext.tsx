import React, { createContext, useContext, useEffect, useState } from 'react';
import { calculateOrderTotals, generatePublicOrderReference } from '../services/orderCalculation';
import { db } from '../services/db';
import { supabaseService } from '../services/supabaseService';
import { dispatchOrderNotification } from '../services/whatsappService';
import { CartItem, Order, OrderType, Product, Restaurant } from '../types';

interface CartContextType {
  items: CartItem[];
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;
  tableNumber: string;
  setTableNumber: (table: string) => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  customerPhone: string;
  setCustomerPhone: (phone: string) => void;
  customerNotes: string;
  setCustomerNotes: (notes: string) => void;
  addItem: (product: Product, quantity: number, options: CartItem['selectedOptions'], instructions?: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  removeItem: (cartItemId: string) => void;
  clearCart: () => void;
  totalItemCount: number;
  subtotal: number;
  taxAmount: number;
  serviceFeeAmount: number;
  total: number;
  isSubmitting: boolean;
  submissionError: string | null;
  submitOrder: (restaurant: Restaurant, availableProducts: Product[]) => Promise<Order | null>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('sofraflow_cart_items');
    return saved ? JSON.parse(saved) : [];
  });

  const [orderType, setOrderType] = useState<OrderType>('dine_in');
  const [tableNumber, setTableNumber] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerNotes, setCustomerNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('sofraflow_cart_items', JSON.stringify(items));
  }, [items]);

  const addItem = (
    product: Product,
    quantity: number,
    selectedOptions: CartItem['selectedOptions'],
    instructions?: string
  ) => {
    // Generate a unique fingerprint based on product + option choices + instructions
    const optionsKey = selectedOptions
      .map(o => `${o.groupId}:${o.choiceId}`)
      .sort()
      .join('|');
    const cartItemId = `${product.id}_${optionsKey}_${instructions || ''}`;

    setItems(prev => {
      const existingIndex = prev.findIndex(i => i.cartItemId === cartItemId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      // Calculate unit price including options
      const optionsModifier = selectedOptions.reduce((acc, opt) => acc + opt.priceModifier, 0);
      const unitPrice = product.price + optionsModifier;

      const newItem: CartItem = {
        cartItemId,
        productId: product.id,
        name: product.name.en || product.name.fr,
        price: unitPrice,
        quantity,
        selectedOptions,
        specialInstructions: instructions,
        imageUrl: product.imageUrl
      };
      return [...prev, newItem];
    });
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setItems(prev => {
      return prev
        .map(item => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  };

  const removeItem = (cartItemId: string) => {
    setItems(prev => prev.filter(i => i.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setItems([]);
    setCustomerNotes('');
    setSubmissionError(null);
  };

  const totalItemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  // Default estimate preview (exact calculation is verified authoritatively on submission)
  const taxAmount = Math.round(subtotal * 0.1 * 100) / 100;
  const serviceFeeAmount = 0;
  const total = Math.round((subtotal + taxAmount + serviceFeeAmount) * 100) / 100;

  const submitOrder = async (restaurant: Restaurant, availableProducts: Product[]): Promise<Order | null> => {
    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      // 1. Authoritative server calculation & validation
      const calculation = calculateOrderTotals({
        restaurantId: restaurant.id,
        orderType,
        tableNumber,
        customerName,
        customerPhone,
        customerNotes,
        cartItems: items,
        availableProducts,
        settings: restaurant.settings
      });

      if (!calculation.isValid) {
        setSubmissionError(calculation.errors.join(' '));
        setIsSubmitting(false);
        return null;
      }

      const now = new Date().toISOString();
      const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const publicRef = generatePublicOrderReference();

      // 2. Create the source-of-truth Order in the database
      const newOrder: Order = {
        id: orderId,
        publicOrderReference: publicRef,
        restaurantId: restaurant.id,
        orderType,
        tableNumber: orderType === 'dine_in' ? tableNumber : undefined,
        customerName: customerName.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        customerNotes: customerNotes.trim() || undefined,
        items: calculation.itemsSnapshot,
        currency: calculation.currency,
        subtotal: calculation.subtotal,
        taxAmount: calculation.taxAmount,
        serviceFeeAmount: calculation.serviceFeeAmount,
        total: calculation.total,
        status: 'new',
        notificationStatus: 'pending',
        statusHistory: [
          { status: 'new', timestamp: now, note: 'Order submitted by customer' }
        ],
        createdAt: now,
        updatedAt: now
      };

      let persistedOrder = newOrder;
      try {
        const supaOrder = await supabaseService.createOrder(newOrder);
        if (supaOrder) {
          persistedOrder = supaOrder;
        }
      } catch (err) {
        console.warn('[CartContext] Supabase order creation fallback to local db:', err);
      }

      // Save order in db (source of truth / local cache)
      db.createOrder(persistedOrder);

      // 3. Asynchronously trigger WhatsApp Notification
      // Note: If WhatsApp notification fails, order remains saved!
      try {
        const notifResult = await dispatchOrderNotification(
          persistedOrder,
          restaurant.whatsappConfig,
          restaurant.name
        );

        // Save notification audit log
        db.saveNotificationEvent(notifResult.event);
        try {
          await supabaseService.saveNotificationEvent(notifResult.event);
        } catch {
          // ignore remote log failure
        }

        // Update order notification status
        db.updateOrderNotificationStatus(
          persistedOrder.id,
          notifResult.event.status,
          notifResult.event.id
        );
        persistedOrder.notificationStatus = notifResult.event.status;
        persistedOrder.notificationEventId = notifResult.event.id;
      } catch (notifErr) {
        console.warn('WhatsApp dispatch warning:', notifErr);
        db.updateOrderNotificationStatus(persistedOrder.id, 'failed');
        persistedOrder.notificationStatus = 'failed';
      }

      // 4. Clear cart on successful order creation
      clearCart();
      setIsSubmitting(false);
      return persistedOrder;
    } catch (err: any) {
      console.error('Order submission failed:', err);
      setSubmissionError(err.message || 'An unexpected error occurred while placing your order.');
      setIsSubmitting(false);
      return null;
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        orderType,
        setOrderType,
        tableNumber,
        setTableNumber,
        customerName,
        setCustomerName,
        customerPhone,
        setCustomerPhone,
        customerNotes,
        setCustomerNotes,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        totalItemCount,
        subtotal,
        taxAmount,
        serviceFeeAmount,
        total,
        isSubmitting,
        submissionError,
        submitOrder
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
