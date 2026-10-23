export type LanguageCode = 'en' | 'fr';
export type FoodLanguageCode = 'en' | 'fr' | 'ar';

export type OrderType = 'dine_in' | 'takeaway' | 'delivery';

export type OrderStatus = 'new' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export type NotificationDeliveryStatus = 'pending' | 'processing' | 'accepted' | 'delivered' | 'failed';

export interface LocalizedString {
  en: string;
  fr: string;
  ar?: string;
}

export interface ProductOptionChoice {
  id: string;
  name: LocalizedString;
  priceModifier: number; // in restaurant currency
}

export interface ProductOptionGroup {
  id: string;
  title: LocalizedString;
  required: boolean;
  minSelections: number;
  maxSelections: number;
  choices: ProductOptionChoice[];
}

export interface Product {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: LocalizedString;
  description: LocalizedString;
  price: number;
  currency: string;
  imageUrl: string;
  isAvailable: boolean;
  dietaryTags: Array<'vegetarian' | 'vegan' | 'halal' | 'gluten_free' | 'spicy' | 'chef_special'>;
  verifiedIngredients: string[];
  verifiedAllergens: string[];
  optionGroups: ProductOptionGroup[];
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface MenuCategory {
  id: string;
  restaurantId: string;
  name: LocalizedString;
  description?: LocalizedString;
  icon?: string;
  sortOrder: number;
}

export interface Menu {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  categoryIds: string[];
  productIds: string[];
  enabledLanguages: FoodLanguageCode[];
  isDefault: boolean;
  updatedAt: string;
}

export interface RestaurantSettings {
  id: string;
  restaurantId: string;
  currency: string;
  taxRatePercent: number; // e.g. 10%
  serviceFeePercent: number; // e.g. 0%
  enableDineIn: boolean;
  enableTakeaway: boolean;
  enableDelivery: boolean;
  requireCustomerPhone: boolean;
  tableCount: number;
  openingHours: {
    [day: string]: { open: string; close: string; closed: boolean };
  };
  customBrandColor?: string;
}

export interface WhatsAppConfig {
  restaurantId: string;
  enabled: boolean;
  destinationPhoneNumber: string; // e.g. +212600123456
  destinationName: string; // e.g. "Kitchen Dispatch"
  apiProvider: 'meta_cloud_api' | 'demo_sandbox';
  phoneNumberId: string;
  wabaId: string; // WhatsApp Business Account ID
  systemAccessToken: string; // Stored securely on server or env
  templateName: string; // e.g. "sofraflow_order_notification_v1"
  templateLanguage: string;
  lastTestStatus?: 'success' | 'failed';
  lastTestTimestamp?: string;
  lastTestError?: string;
}

export interface NotificationEvent {
  id: string;
  orderId: string;
  restaurantId: string;
  destinationPhoneNumber: string;
  status: NotificationDeliveryStatus;
  provider: string;
  providerMessageId?: string;
  attemptCount: number;
  payloadSnapshot: Record<string, any>;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItemOptionSelection {
  groupId: string;
  groupTitle: string;
  choiceId: string;
  choiceName: string;
  priceModifier: number;
}

export interface CartItem {
  cartItemId: string; // unique per cart item configuration
  productId: string;
  name: string;
  price: number;
  quantity: number;
  selectedOptions: CartItemOptionSelection[];
  specialInstructions?: string;
  imageUrl?: string;
}

export interface OrderItemSnapshot {
  productId: string;
  productName: LocalizedString;
  unitPrice: number;
  quantity: number;
  selectedOptions: CartItemOptionSelection[];
  specialInstructions?: string;
  subtotal: number;
}

export interface Order {
  id: string;
  publicOrderReference: string; // e.g. SF-7829
  restaurantId: string;
  orderType: OrderType;
  tableNumber?: string;
  customerName?: string;
  customerPhone?: string;
  customerNotes?: string;
  items: OrderItemSnapshot[];
  currency: string;
  subtotal: number;
  taxAmount: number;
  serviceFeeAmount: number;
  total: number;
  status: OrderStatus;
  notificationStatus: NotificationDeliveryStatus;
  notificationEventId?: string;
  statusHistory: Array<{
    status: OrderStatus;
    timestamp: string;
    note?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  businessType?: string;
  description: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  contactEmail?: string;
  ownerId?: string;
  currency?: string;
  logoUrl: string;
  coverImageUrl: string;
  settings: RestaurantSettings;
  whatsappConfig: WhatsAppConfig;
  subscriptionPlan: 'starter' | 'growth' | 'pro' | 'enterprise';
  subscriptionStatus: 'active' | 'trial' | 'past_due';
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  restaurantId: string;
  role: 'admin' | 'owner' | 'manager' | 'staff';
  preferredLanguage?: LanguageCode;
  preferredTheme?: 'light' | 'dark' | 'system';
  createdAt?: string;
  updatedAt?: string;
}

export interface QrCodeConfig {
  id: string;
  restaurantId: string;
  tableNumber?: string;
  targetUrl: string;
  label: string;
  customColor: string;
  showLogo: boolean;
  createdAt: string;
}

export type BusinessSector = 'restaurant' | 'cafe' | 'snack' | 'bakery' | 'other';

export interface ZinaOnboardingState {
  currentStep: number;
  restaurantName: string;
  managerName: string;
  businessType: BusinessSector;
  customBusinessType?: string;
  city: string;
  area?: string;
  street?: string;
  businessEmail: string;
  whatsappPhone: string;
  preferredLanguage: LanguageCode;
  goals: string[];
  isCompleted: boolean;
}

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  recommendedProductIds?: string[];
  budgetSuggestion?: string;
  timestamp: string;
}

export interface DemoDish {
  id: string;
  name: LocalizedString;
  category: string;
  description: LocalizedString;
  price: number;
  currency: string;
  imageUrl: string;
  popular?: boolean;
  dietary?: 'vegetarian' | 'halal' | 'chef_special';
  pairings?: string[]; // IDs of complementary items
}

export type MoroccanPaymentMethod = 'cih_bank' | 'attijariwafa_bank' | 'cash_plus' | 'western_union' | 'moneygram' | 'ria';

export type PaymentVerificationStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'cancelled';

export interface SubscriptionPaymentRequest {
  id: string;
  restaurantId: string;
  restaurantName?: string;
  userId: string;
  userName?: string;
  plan: 'starter' | 'growth' | 'pro' | 'enterprise';
  billingPeriod: 'monthly' | 'annual';
  amount: number;
  currency: string;
  paymentMethod: MoroccanPaymentMethod;
  transactionReference: string;
  receiptUrl?: string;
  receiptFileName?: string;
  status: PaymentVerificationStatus;
  rejectionReason?: string;
  payerName?: string;
  payerPhone?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

