import {
  Menu,
  MenuCategory,
  NotificationEvent,
  Order,
  Product,
  Restaurant,
  User,
  WhatsAppConfig,
  SubscriptionPaymentRequest,
  PaymentVerificationStatus
} from '../types';
import { normalizePhoneNumber } from '../utils/phoneValidation';

const STORAGE_KEYS = {
  RESTAURANTS: 'sofraflow_restaurants_v1',
  MENUS: 'sofraflow_menus_v1',
  CATEGORIES: 'sofraflow_categories_v1',
  PRODUCTS: 'sofraflow_products_v1',
  ORDERS: 'sofraflow_orders_v1',
  NOTIFICATIONS: 'sofraflow_notifications_v1',
  CURRENT_USER: 'sofraflow_current_user_v1',
  ACTIVE_RESTAURANT_ID: 'sofraflow_active_restaurant_id_v1',
  PAYMENT_REQUESTS: 'sofraflow_payment_requests_v1'
};

// Production initial data: Seed arrays are empty so dashboard displays only genuine user-created records.
const SEED_RESTAURANTS: Restaurant[] = [];

const SEED_CATEGORIES: MenuCategory[] = [];

const SEED_PRODUCTS: Product[] = [];

const SEED_MENUS: Menu[] = [];

const SEED_ORDERS: Order[] = [];
const SEED_USER: User | null = null;

class SafeStorage {
  private memory: Record<string, string> = {};
  private getStorage(): Storage | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage;
      }
      if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
        return (globalThis as any).localStorage;
      }
    } catch (e) {}
    return null;
  }
  getItem(key: string): string | null {
    try {
      const storage = this.getStorage();
      if (storage) {
        return storage.getItem(key);
      }
    } catch (e) {}
    return this.memory[key] ?? null;
  }
  setItem(key: string, value: string): void {
    try {
      const storage = this.getStorage();
      if (storage) {
        storage.setItem(key, value);
        return;
      }
    } catch (e) {}
    this.memory[key] = value;
  }
  removeItem(key: string): void {
    try {
      const storage = this.getStorage();
      if (storage) {
        storage.removeItem(key);
        return;
      }
    } catch (e) {}
    delete this.memory[key];
  }
}
const appStorage = new SafeStorage();

// Database class implementing Tenant-Isolated Storage
class DatabaseService {
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.init();
  }

  private init() {
    if (!appStorage.getItem(STORAGE_KEYS.RESTAURANTS)) {
      appStorage.setItem(STORAGE_KEYS.RESTAURANTS, JSON.stringify([]));
    }
    if (!appStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      appStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify([]));
    }
    if (!appStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      appStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify([]));
    }
    if (!appStorage.getItem(STORAGE_KEYS.MENUS)) {
      appStorage.setItem(STORAGE_KEYS.MENUS, JSON.stringify([]));
    }
    if (!appStorage.getItem(STORAGE_KEYS.ORDERS)) {
      appStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
    }

    // Clean up legacy development dummy restaurants from local storage if present
    const existing = appStorage.getItem(STORAGE_KEYS.RESTAURANTS);
    if (existing) {
      try {
        const parsed: Restaurant[] = JSON.parse(existing);
        const filtered = parsed.filter(
          r => r.id !== 'rest_marrakech_01' && r.id !== 'rest_casablanca_02'
        );
        if (filtered.length !== parsed.length) {
          appStorage.setItem(STORAGE_KEYS.RESTAURANTS, JSON.stringify(filtered));
        }
      } catch {}
    }

    const activeRestId = appStorage.getItem(STORAGE_KEYS.ACTIVE_RESTAURANT_ID);
    if (activeRestId === 'rest_marrakech_01' || activeRestId === 'rest_casablanca_02') {
      appStorage.removeItem(STORAGE_KEYS.ACTIVE_RESTAURANT_ID);
    }
  }

  public subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notify() {
    this.listeners.forEach(cb => {
      try { cb(); } catch (e) { console.error('Subscription error', e); }
    });
  }

  // --- RESTAURANTS ---
  public getRestaurants(ownerId?: string): Restaurant[] {
    const data = appStorage.getItem(STORAGE_KEYS.RESTAURANTS);
    const list: Restaurant[] = data ? JSON.parse(data) : [];
    if (ownerId) {
      return list.filter(r => r.ownerId === ownerId);
    }
    return list;
  }

  public getRestaurantById(id: string): Restaurant | undefined {
    return this.getRestaurants().find(r => r.id === id);
  }

  public getRestaurantBySlug(slug: string): Restaurant | undefined {
    return this.getRestaurants().find(r => r.slug.toLowerCase() === slug.toLowerCase());
  }

  public updateRestaurant(restaurant: Restaurant): void {
    const restaurants = this.getRestaurants();
    const index = restaurants.findIndex(r => r.id === restaurant.id);
    if (index >= 0) {
      restaurants[index] = restaurant;
      appStorage.setItem(STORAGE_KEYS.RESTAURANTS, JSON.stringify(restaurants));
      this.notify();
    }
  }

  public createRestaurant(data: Partial<Restaurant> & { name: string; slug: string }): Restaurant {
    const restaurants = this.getRestaurants();
    const id = data.id || `rest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newRest: Restaurant = {
      id,
      name: data.name,
      slug: data.slug,
      businessType: data.businessType || 'restaurant',
      description: data.description || 'Welcome to our restaurant menu.',
      address: data.address || '',
      city: data.city || 'Casablanca',
      country: data.country || 'Morocco',
      phone: data.phone || '+212',
      contactEmail: data.contactEmail,
      ownerId: data.ownerId,
      currency: data.currency || 'MAD',
      logoUrl: data.logoUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&auto=format&fit=crop&q=80',
      coverImageUrl: data.coverImageUrl || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&auto=format&fit=crop&q=80',
      settings: {
        id: `set_${id}`,
        restaurantId: id,
        currency: 'MAD',
        taxRatePercent: 10,
        serviceFeePercent: 0,
        enableDineIn: true,
        enableTakeaway: true,
        enableDelivery: false,
        requireCustomerPhone: false,
        tableCount: 15,
        openingHours: {
          monday: { open: '10:00', close: '23:00', closed: false },
          tuesday: { open: '10:00', close: '23:00', closed: false },
          wednesday: { open: '10:00', close: '23:00', closed: false },
          thursday: { open: '10:00', close: '23:00', closed: false },
          friday: { open: '10:00', close: '23:00', closed: false },
          saturday: { open: '10:00', close: '23:00', closed: false },
          sunday: { open: '10:00', close: '23:00', closed: false }
        }
      },
      whatsappConfig: {
        restaurantId: id,
        enabled: true,
        destinationPhoneNumber: data.phone || '',
        destinationName: 'Order Desk',
        apiProvider: 'meta_cloud_api',
        phoneNumberId: '',
        wabaId: '',
        systemAccessToken: '',
        templateName: 'sofraflow_order_notification_v1',
        templateLanguage: 'en_US'
      },
      subscriptionPlan: 'starter',
      subscriptionStatus: 'active'
    };

    restaurants.push(newRest);
    appStorage.setItem(STORAGE_KEYS.RESTAURANTS, JSON.stringify(restaurants));

    // Create a starter default category and menu for this new restaurant
    this.createCategory({
      restaurantId: id,
      name: { en: 'Main Menu', fr: 'Menu Principal', ar: 'القائمة الرئيسية' },
      sortOrder: 1
    });

    this.createMenu({
      restaurantId: id,
      name: 'Main Digital Menu',
      slug: 'main',
      status: 'published',
      categoryIds: [],
      productIds: [],
      enabledLanguages: ['en', 'fr', 'ar'],
      isDefault: true,
      description: 'Standard ordering menu'
    });

    this.notify();
    return newRest;
  }

  // --- CATEGORIES (TENANT-ISOLATED) ---
  public getCategories(restaurantId: string): MenuCategory[] {
    const raw = appStorage.getItem(STORAGE_KEYS.CATEGORIES);
    const list: MenuCategory[] = raw ? JSON.parse(raw) : [];
    return list
      .filter(c => c.restaurantId === restaurantId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  public createCategory(category: Omit<MenuCategory, 'id'>): MenuCategory {
    const raw = appStorage.getItem(STORAGE_KEYS.CATEGORIES);
    const list: MenuCategory[] = raw ? JSON.parse(raw) : [];
    const newCat: MenuCategory = {
      ...category,
      id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    };
    list.push(newCat);
    appStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(list));
    this.notify();
    return newCat;
  }

  public updateCategory(category: MenuCategory): void {
    const raw = appStorage.getItem(STORAGE_KEYS.CATEGORIES);
    const list: MenuCategory[] = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex(c => c.id === category.id && c.restaurantId === category.restaurantId);
    if (idx >= 0) {
      list[idx] = category;
      appStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(list));
      this.notify();
    }
  }

  public deleteCategory(id: string, restaurantId: string): void {
    const raw = appStorage.getItem(STORAGE_KEYS.CATEGORIES);
    const list: MenuCategory[] = raw ? JSON.parse(raw) : [];
    const filtered = list.filter(c => !(c.id === id && c.restaurantId === restaurantId));
    appStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(filtered));
    this.notify();
  }

  // --- PRODUCTS (TENANT-ISOLATED) ---
  public getProducts(restaurantId: string): Product[] {
    const raw = appStorage.getItem(STORAGE_KEYS.PRODUCTS);
    const list: Product[] = raw ? JSON.parse(raw) : [];
    return list
      .filter(p => p.restaurantId === restaurantId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  public getProductById(id: string, restaurantId: string): Product | undefined {
    return this.getProducts(restaurantId).find(p => p.id === id);
  }

  public createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const raw = appStorage.getItem(STORAGE_KEYS.PRODUCTS);
    const list: Product[] = raw ? JSON.parse(raw) : [];
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...data,
      id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: now,
      updatedAt: now
    };
    list.push(newProduct);
    appStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(list));
    this.notify();
    return newProduct;
  }

  public updateProduct(product: Product): void {
    const raw = appStorage.getItem(STORAGE_KEYS.PRODUCTS);
    const list: Product[] = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex(p => p.id === product.id && p.restaurantId === product.restaurantId);
    if (idx >= 0) {
      list[idx] = { ...product, updatedAt: new Date().toISOString() };
      appStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(list));
      this.notify();
    }
  }

  public deleteProduct(id: string, restaurantId: string): void {
    const raw = appStorage.getItem(STORAGE_KEYS.PRODUCTS);
    const list: Product[] = raw ? JSON.parse(raw) : [];
    const filtered = list.filter(p => !(p.id === id && p.restaurantId === restaurantId));
    appStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
    this.notify();
  }

  // --- MENUS (TENANT-ISOLATED) ---
  public getMenus(restaurantId: string): Menu[] {
    const raw = appStorage.getItem(STORAGE_KEYS.MENUS);
    const list: Menu[] = raw ? JSON.parse(raw) : [];
    return list.filter(m => m.restaurantId === restaurantId);
  }

  public getMenuById(id: string, restaurantId: string): Menu | undefined {
    return this.getMenus(restaurantId).find(m => m.id === id);
  }

  public getPublishedMenuBySlug(restaurantId: string, slug: string): Menu | undefined {
    const menus = this.getMenus(restaurantId);
    return menus.find(m => m.status === 'published' && (m.slug === slug || (slug === 'main' && m.isDefault)));
  }

  public createMenu(data: Omit<Menu, 'id' | 'updatedAt'>): Menu {
    const raw = appStorage.getItem(STORAGE_KEYS.MENUS);
    const list: Menu[] = raw ? JSON.parse(raw) : [];
    const newMenu: Menu = {
      ...data,
      id: `menu_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      updatedAt: new Date().toISOString()
    };
    list.push(newMenu);
    appStorage.setItem(STORAGE_KEYS.MENUS, JSON.stringify(list));
    this.notify();
    return newMenu;
  }

  public updateMenu(menu: Menu): void {
    const raw = appStorage.getItem(STORAGE_KEYS.MENUS);
    const list: Menu[] = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex(m => m.id === menu.id && m.restaurantId === menu.restaurantId);
    if (idx >= 0) {
      list[idx] = { ...menu, updatedAt: new Date().toISOString() };
      appStorage.setItem(STORAGE_KEYS.MENUS, JSON.stringify(list));
      this.notify();
    }
  }

  public deleteMenu(id: string, restaurantId: string): void {
    const raw = appStorage.getItem(STORAGE_KEYS.MENUS);
    const list: Menu[] = raw ? JSON.parse(raw) : [];
    const filtered = list.filter(m => !(m.id === id && m.restaurantId === restaurantId));
    appStorage.setItem(STORAGE_KEYS.MENUS, JSON.stringify(filtered));
    this.notify();
  }

  // --- ORDERS (TENANT-ISOLATED) ---
  public getOrders(restaurantId: string): Order[] {
    const raw = appStorage.getItem(STORAGE_KEYS.ORDERS);
    const list: Order[] = raw ? JSON.parse(raw) : [];
    return list
      .filter(o => o.restaurantId === restaurantId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getOrderById(id: string): Order | undefined {
    const raw = appStorage.getItem(STORAGE_KEYS.ORDERS);
    const list: Order[] = raw ? JSON.parse(raw) : [];
    return list.find(o => o.id === id);
  }

  public getOrderByPublicReference(ref: string): Order | undefined {
    const raw = appStorage.getItem(STORAGE_KEYS.ORDERS);
    const list: Order[] = raw ? JSON.parse(raw) : [];
    return list.find(o => o.publicOrderReference.toUpperCase() === ref.toUpperCase());
  }

  public createOrder(order: Order): Order {
    const raw = appStorage.getItem(STORAGE_KEYS.ORDERS);
    const list: Order[] = raw ? JSON.parse(raw) : [];
    list.unshift(order);
    appStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(list));
    this.notify();
    return order;
  }

  public updateOrderStatus(orderId: string, restaurantId: string, status: Order['status'], note?: string): Order | undefined {
    const raw = appStorage.getItem(STORAGE_KEYS.ORDERS);
    const list: Order[] = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex(o => o.id === orderId && o.restaurantId === restaurantId);
    if (idx >= 0) {
      const existing = list[idx];
      const now = new Date().toISOString();
      existing.status = status;
      existing.updatedAt = now;
      if (!existing.statusHistory) {
        existing.statusHistory = [];
      }
      existing.statusHistory.push({
        status,
        timestamp: now,
        note
      });
      list[idx] = existing;
      appStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(list));
      this.notify();
      return existing;
    }
    return undefined;
  }

  public updateOrderNotificationStatus(orderId: string, status: Order['notificationStatus'], eventId?: string): void {
    const raw = appStorage.getItem(STORAGE_KEYS.ORDERS);
    const list: Order[] = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex(o => o.id === orderId);
    if (idx >= 0) {
      list[idx].notificationStatus = status;
      if (eventId) {
        list[idx].notificationEventId = eventId;
      }
      list[idx].updatedAt = new Date().toISOString();
      appStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(list));
      this.notify();
    }
  }

  // --- NOTIFICATION AUDIT EVENTS ---
  public getNotificationEvents(restaurantId: string): NotificationEvent[] {
    const raw = appStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const list: NotificationEvent[] = raw ? JSON.parse(raw) : [];
    return list
      .filter(n => n.restaurantId === restaurantId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public saveNotificationEvent(event: NotificationEvent): void {
    const raw = appStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const list: NotificationEvent[] = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex(n => n.id === event.id);
    if (idx >= 0) {
      list[idx] = event;
    } else {
      list.unshift(event);
    }
    appStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
    this.notify();
  }

  // --- AUTH / SESSION ---
  public getCurrentUser(): User | null {
    const raw = appStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return raw ? JSON.parse(raw) : null;
  }

  public setCurrentUser(user: User | null): void {
    if (user) {
      appStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      appStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
    this.notify();
  }

  public updateUserPreferences(preferences: { preferredLanguage?: 'en' | 'fr'; preferredTheme?: 'light' | 'dark' | 'system' }): User | null {
    const user = this.getCurrentUser();
    if (!user) return null;
    const updated: User = {
      ...user,
      ...preferences
    };
    this.setCurrentUser(updated);
    return updated;
  }

  public isPhoneTaken(phone: string, excludeUserId?: string): boolean {
    if (!phone) return false;
    const normalized = normalizePhoneNumber(phone);
    if (!normalized) return false;

    const registeredPhones = appStorage.getItem('sofraflow_registered_phones_v1');
    const phoneMap: Record<string, string> = registeredPhones ? JSON.parse(registeredPhones) : {};

    for (const [userId, storedPhone] of Object.entries(phoneMap)) {
      if (userId !== excludeUserId && normalizePhoneNumber(storedPhone) === normalized) {
        return true;
      }
    }
    return false;
  }

  public registerUserPhone(userId: string, phone: string): void {
    const normalized = normalizePhoneNumber(phone);
    const registeredPhones = appStorage.getItem('sofraflow_registered_phones_v1');
    const phoneMap: Record<string, string> = registeredPhones ? JSON.parse(registeredPhones) : {};
    phoneMap[userId] = normalized;
    appStorage.setItem('sofraflow_registered_phones_v1', JSON.stringify(phoneMap));
  }

  public updateUserProfile(updates: { fullName?: string; phone?: string; preferredLanguage?: 'en' | 'fr' }): User | null {
    const user = this.getCurrentUser();
    if (!user) return null;

    let cleanPhone = updates.phone;
    if (cleanPhone !== undefined && cleanPhone !== null && cleanPhone.trim() !== '') {
      cleanPhone = normalizePhoneNumber(cleanPhone);
      if (this.isPhoneTaken(cleanPhone, user.id)) {
        throw new Error('duplicate_phone_number');
      }
      this.registerUserPhone(user.id, cleanPhone);
    } else if (cleanPhone !== undefined) {
      cleanPhone = '';
      const registeredPhones = appStorage.getItem('sofraflow_registered_phones_v1');
      if (registeredPhones) {
        const phoneMap: Record<string, string> = JSON.parse(registeredPhones);
        delete phoneMap[user.id];
        appStorage.setItem('sofraflow_registered_phones_v1', JSON.stringify(phoneMap));
      }
    }

    const updated: User = {
      ...user,
      fullName: updates.fullName !== undefined ? updates.fullName.trim() : user.fullName,
      phone: cleanPhone !== undefined ? cleanPhone : user.phone,
      preferredLanguage: updates.preferredLanguage !== undefined ? updates.preferredLanguage : user.preferredLanguage
    };
    this.setCurrentUser(updated);
    return updated;
  }

  public getActiveRestaurantId(): string | null {
    return appStorage.getItem(STORAGE_KEYS.ACTIVE_RESTAURANT_ID);
  }

  public setActiveRestaurantId(id: string): void {
    appStorage.setItem(STORAGE_KEYS.ACTIVE_RESTAURANT_ID, id);
    const user = this.getCurrentUser();
    if (user) {
      user.restaurantId = id;
      this.setCurrentUser(user);
    }
    this.notify();
  }

  // -------------------------------------------------------------
  // Subscription Payment Requests
  // -------------------------------------------------------------
  public getPaymentRequests(restaurantId?: string, isStaffOrAdmin: boolean = false): SubscriptionPaymentRequest[] {
    const raw = appStorage.getItem(STORAGE_KEYS.PAYMENT_REQUESTS);
    const requests: SubscriptionPaymentRequest[] = raw ? JSON.parse(raw) : [];
    if (restaurantId && !isStaffOrAdmin) {
      return requests.filter(r => r.restaurantId === restaurantId);
    }
    return requests;
  }

  public getPaymentRequestById(id: string): SubscriptionPaymentRequest | null {
    const requests = this.getPaymentRequests();
    return requests.find(r => r.id === id) || null;
  }

  public createPaymentRequest(
    data: Omit<SubscriptionPaymentRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>
  ): SubscriptionPaymentRequest {
    const requests = this.getPaymentRequests();
    const newRequest: SubscriptionPaymentRequest = {
      ...data,
      id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      status: 'under_review',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    requests.unshift(newRequest);
    appStorage.setItem(STORAGE_KEYS.PAYMENT_REQUESTS, JSON.stringify(requests));
    this.notify();
    return newRequest;
  }

  public updatePaymentRequestStatus(
    id: string,
    status: PaymentVerificationStatus,
    details?: { reason?: string; verifierId?: string }
  ): SubscriptionPaymentRequest | null {
    const requests = this.getPaymentRequests();
    const index = requests.findIndex(r => r.id === id);
    if (index === -1) return null;

    const current = requests[index];
    const updated: SubscriptionPaymentRequest = {
      ...current,
      status,
      rejectionReason: details?.reason || current.rejectionReason,
      verifiedBy: details?.verifierId || current.verifiedBy,
      verifiedAt: status === 'approved' || status === 'rejected' ? new Date().toISOString() : current.verifiedAt,
      updatedAt: new Date().toISOString()
    };

    requests[index] = updated;
    appStorage.setItem(STORAGE_KEYS.PAYMENT_REQUESTS, JSON.stringify(requests));

    // If approved, automatically update the restaurant's subscription plan & status
    if (status === 'approved' && current.restaurantId) {
      const rest = this.getRestaurantById(current.restaurantId);
      if (rest) {
        this.updateRestaurant({
          ...rest,
          subscriptionPlan: current.plan,
          subscriptionStatus: 'active'
        });
      }
    }

    this.notify();
    return updated;
  }

  // Reset to initial seed state
  public resetToSeed(): void {
    appStorage.setItem(STORAGE_KEYS.RESTAURANTS, JSON.stringify(SEED_RESTAURANTS));
    appStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(SEED_CATEGORIES));
    appStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(SEED_PRODUCTS));
    appStorage.setItem(STORAGE_KEYS.MENUS, JSON.stringify(SEED_MENUS));
    appStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(SEED_ORDERS));
    appStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(SEED_USER));
    appStorage.removeItem(STORAGE_KEYS.ACTIVE_RESTAURANT_ID);
    appStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    appStorage.removeItem(STORAGE_KEYS.PAYMENT_REQUESTS);
    this.notify();
  }
}

export const db = new DatabaseService();
