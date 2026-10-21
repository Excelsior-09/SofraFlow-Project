import { CartItem, Order, OrderItemSnapshot, Product, RestaurantSettings } from '../types';

export interface OrderCalculationInput {
  restaurantId: string;
  orderType: 'dine_in' | 'takeaway' | 'delivery';
  tableNumber?: string;
  customerName?: string;
  customerPhone?: string;
  customerNotes?: string;
  cartItems: CartItem[];
  availableProducts: Product[];
  settings: RestaurantSettings;
}

export interface CalculationResult {
  isValid: boolean;
  errors: string[];
  subtotal: number;
  taxAmount: number;
  serviceFeeAmount: number;
  total: number;
  currency: string;
  itemsSnapshot: OrderItemSnapshot[];
}

/**
 * Server-authoritative calculation:
 * Never trusts prices sent from the client. Re-fetches prices from verified product data.
 */
export function calculateOrderTotals(input: OrderCalculationInput): CalculationResult {
  const errors: string[] = [];
  const itemsSnapshot: OrderItemSnapshot[] = [];
  let calculatedSubtotal = 0;

  if (!input.cartItems || input.cartItems.length === 0) {
    errors.push('The cart is empty. Please add items before submitting.');
    return {
      isValid: false,
      errors,
      subtotal: 0,
      taxAmount: 0,
      serviceFeeAmount: 0,
      total: 0,
      currency: input.settings.currency || 'MAD',
      itemsSnapshot: []
    };
  }

  // Validate order type & required fields
  if (input.orderType === 'dine_in' && (!input.tableNumber || input.tableNumber.trim() === '')) {
    errors.push('A table number is required for dine-in orders.');
  }

  if (input.settings.requireCustomerPhone && (!input.customerPhone || input.customerPhone.trim().length < 8)) {
    errors.push('A valid customer phone number is required by the restaurant.');
  }

  for (const cartItem of input.cartItems) {
    const matchedProduct = input.availableProducts.find(p => p.id === cartItem.productId);

    if (!matchedProduct) {
      errors.push(`Product "${cartItem.name}" is no longer available.`);
      continue;
    }

    if (!matchedProduct.isAvailable) {
      errors.push(`"${matchedProduct.name.en || matchedProduct.name.fr}" is currently sold out.`);
      continue;
    }

    if (cartItem.quantity <= 0 || !Number.isInteger(cartItem.quantity)) {
      errors.push(`Invalid quantity for ${cartItem.name}.`);
      continue;
    }

    // Verify option price modifiers from matched product
    let optionsModifierTotal = 0;
    const validatedOptions = [];

    for (const selectedOpt of cartItem.selectedOptions || []) {
      const group = matchedProduct.optionGroups.find(g => g.id === selectedOpt.groupId);
      if (group) {
        const choice = group.choices.find(c => c.id === selectedOpt.choiceId);
        if (choice) {
          optionsModifierTotal += choice.priceModifier;
          validatedOptions.push({
            groupId: group.id,
            groupTitle: group.title.en || group.title.fr,
            choiceId: choice.id,
            choiceName: choice.name.en || choice.name.fr,
            priceModifier: choice.priceModifier
          });
        }
      }
    }

    const verifiedUnitPrice = matchedProduct.price + optionsModifierTotal;
    const lineSubtotal = verifiedUnitPrice * cartItem.quantity;
    calculatedSubtotal += lineSubtotal;

    itemsSnapshot.push({
      productId: matchedProduct.id,
      productName: matchedProduct.name,
      unitPrice: verifiedUnitPrice,
      quantity: cartItem.quantity,
      selectedOptions: validatedOptions,
      specialInstructions: cartItem.specialInstructions?.trim() || undefined,
      subtotal: lineSubtotal
    });
  }

  // Tax and service fee calculations
  const taxRate = (input.settings.taxRatePercent || 0) / 100;
  const taxAmount = Math.round(calculatedSubtotal * taxRate * 100) / 100;

  const serviceFeeRate = (input.settings.serviceFeePercent || 0) / 100;
  const serviceFeeAmount = Math.round(calculatedSubtotal * serviceFeeRate * 100) / 100;

  const total = Math.round((calculatedSubtotal + taxAmount + serviceFeeAmount) * 100) / 100;

  return {
    isValid: errors.length === 0,
    errors,
    subtotal: calculatedSubtotal,
    taxAmount,
    serviceFeeAmount,
    total,
    currency: input.settings.currency || 'MAD',
    itemsSnapshot
  };
}

/**
 * Generates human-friendly, stable public order references (e.g. SF-9241)
 */
export function generatePublicOrderReference(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `SF-${num}`;
}
