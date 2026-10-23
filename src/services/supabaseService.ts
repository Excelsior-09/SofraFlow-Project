import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  Restaurant,
  Menu,
  MenuCategory,
  Product,
  Order,
  QrCodeConfig,
  LocalizedString,
  SubscriptionPaymentRequest,
  PaymentVerificationStatus,
  MoroccanPaymentMethod,
  NotificationEvent
} from '../types';
import { normalizePhoneNumber } from '../utils/phoneValidation';

export interface UserProfile {
  id: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  role: 'admin' | 'owner' | 'manager' | 'staff';
  preferredLanguage: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * High-Level Supabase Service for SofraFlow
 * Handles all PostgreSQL interactions with Row Level Security enforcement
 */
export const supabaseService = {
  // ------------------------------------------------------------------
  // 1. PROFILES
  // ------------------------------------------------------------------
  async getProfile(userId: string): Promise<UserProfile | null> {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('[Supabase] Error fetching profile:', error.message);
      return null;
    }
    if (!data) return null;

    return {
      id: data.id,
      fullName: data.full_name || '',
      phone: data.phone || '',
      avatarUrl: data.avatar_url || '',
      role: data.role || 'owner',
      preferredLanguage: data.preferred_language || 'fr',
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async isPhoneTaken(phone: string, excludeUserId?: string): Promise<boolean> {
    if (!isSupabaseConfigured || !phone) return false;
    const normalized = normalizePhoneNumber(phone);
    if (!normalized) return false;

    try {
      let query = supabase
        .from('profiles')
        .select('id')
        .eq('phone', normalized);

      if (excludeUserId) {
        query = query.neq('id', excludeUserId);
      }

      const { data, error } = await query.limit(1);
      if (error) {
        console.warn('[Supabase] Phone check warning:', error.message);
        return false;
      }
      return Boolean(data && data.length > 0);
    } catch {
      return false;
    }
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    let cleanPhone = updates.phone;
    if (cleanPhone !== undefined && cleanPhone !== null && cleanPhone.trim() !== '') {
      cleanPhone = normalizePhoneNumber(cleanPhone);
      // Pre-check for duplicate phone excluding current user
      const taken = await this.isPhoneTaken(cleanPhone, userId);
      if (taken) {
        const err: any = new Error('duplicate_phone_number');
        err.code = '23505';
        throw err;
      }
    } else if (cleanPhone !== undefined) {
      cleanPhone = '';
    }

    const payload: Record<string, any> = {
      updated_at: new Date().toISOString()
    };
    if (updates.fullName !== undefined) payload.full_name = updates.fullName.trim();
    if (cleanPhone !== undefined) payload.phone = cleanPhone;
    if (updates.avatarUrl !== undefined) payload.avatar_url = updates.avatarUrl;
    if (updates.preferredLanguage !== undefined) payload.preferred_language = updates.preferredLanguage;

    const { error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', userId);

    if (error) {
      console.error('[Supabase] Error updating profile:', error.message);
      if (error.code === '23505' || error.message.includes('duplicate') || error.message.includes('idx_profiles_phone_unique')) {
        const err: any = new Error('duplicate_phone_number');
        err.code = '23505';
        throw err;
      }
      throw error;
    }
    return true;
  },

  async createProfileIfMissing(
    userId: string,
    initialData: { fullName: string; phone?: string; email?: string }
  ): Promise<UserProfile | null> {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        {
          id: userId,
          full_name: initialData.fullName || (initialData.email ? initialData.email.split('@')[0] : 'Owner'),
          phone: initialData.phone || null,
          role: 'owner',
          preferred_language: 'fr',
          updated_at: new Date().toISOString()
        },
        { onConflict: 'id' }
      )
      .select()
      .maybeSingle();

    if (error) {
      console.warn('[Supabase] Upsert profile notice:', error.message);
      return null;
    }
    if (!data) return null;

    return {
      id: data.id,
      fullName: data.full_name || '',
      phone: data.phone || '',
      avatarUrl: data.avatar_url || '',
      role: data.role || 'owner',
      preferredLanguage: data.preferred_language || 'fr',
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  // ------------------------------------------------------------------
  // 2. RESTAURANTS / BUSINESSES
  // ------------------------------------------------------------------
  async getRestaurantsForOwner(ownerId: string): Promise<Restaurant[]> {
    if (!isSupabaseConfigured) return [];
    try {
      // 1. Direct owner restaurants
      const { data: directRests, error: directErr } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: true });

      if (directErr) {
        console.warn('[Supabase] Error fetching owner restaurants:', directErr.message);
      }

      // 2. Also check business_members for multi-venue or staff/manager memberships
      let memberRestIds: string[] = [];
      try {
        const { data: memberData } = await supabase
          .from('business_members')
          .select('business_id')
          .eq('user_id', ownerId)
          .eq('status', 'active');
        if (memberData && memberData.length > 0) {
          memberRestIds = memberData.map(m => m.business_id);
        }
      } catch {
        // Table might not exist yet
      }

      let allRows = directRests || [];
      if (memberRestIds.length > 0) {
        const existingIds = new Set(allRows.map(r => r.id));
        const missingIds = memberRestIds.filter(id => !existingIds.has(id));
        if (missingIds.length > 0) {
          const { data: moreRests } = await supabase
            .from('restaurants')
            .select('*')
            .in('id', missingIds);
          if (moreRests && moreRests.length > 0) {
            allRows = [...allRows, ...moreRests];
          }
        }
      }

      return allRows.map(r => supabaseService.mapRestaurantRow(r));
    } catch (err) {
      console.error('[Supabase] getRestaurantsForOwner exception:', err);
      return [];
    }
  },

  async getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      console.error('[Supabase] Error fetching restaurant by slug:', error.message);
      return null;
    }
    if (!data) return null;

    return supabaseService.mapRestaurantRow(data);
  },

  async getRestaurantById(id: string): Promise<Restaurant | null> {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('[Supabase] Error fetching restaurant by id:', error.message);
        return null;
      }
      if (!data) return null;

      return supabaseService.mapRestaurantRow(data);
    } catch (err) {
      console.warn('[Supabase] getRestaurantById exception:', err);
      return null;
    }
  },

  async createRestaurant(
    ownerId: string,
    params: {
      name: string;
      slug: string;
      businessType?: string;
      phone?: string;
      city?: string;
      description?: string;
      address?: string;
      contactEmail?: string;
    }
  ): Promise<Restaurant | null> {
    if (!isSupabaseConfigured) return null;

    // 1. Try atomic database RPC function first
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('create_restaurant', {
        p_name: params.name,
        p_slug: params.slug,
        p_business_type: params.businessType || 'restaurant',
        p_phone: params.phone || '+212600000000',
        p_city: params.city || 'Casablanca',
        p_address: params.address || 'Morocco',
        p_description: params.description || `Welcome to ${params.name}. Explore our digital menu and order with ease.`,
        p_contact_email: params.contactEmail || ''
      });
      if (!rpcError && rpcData) {
        return supabaseService.mapRestaurantRow(rpcData);
      }
      if (rpcError && !rpcError.message.includes('function') && !rpcError.message.includes('not found')) {
        console.warn('[Supabase] create_restaurant RPC note:', rpcError.message);
      }
    } catch (rpcErr) {
      // Fall through to direct table insert
    }

    // 2. Direct table insert fallback
    const validTypes = ['restaurant', 'cafe', 'snack', 'bakery', 'other'];
    const businessType = validTypes.includes(params.businessType || '') ? params.businessType : 'restaurant';
    const cleanSlug = params.slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '') || `restaurant-${Date.now().toString().slice(-4)}`;

    const insertPayload: Record<string, any> = {
      owner_id: ownerId,
      name: params.name.trim(),
      slug: cleanSlug,
      business_type: businessType,
      phone: params.phone || '+212600000000',
      contact_email: params.contactEmail || null,
      city: params.city || 'Casablanca',
      description: params.description || `Welcome to ${params.name}. Explore our digital menu and order with ease.`,
      address: params.address || 'Morocco',
      country: 'Morocco',
      currency: 'MAD',
      primary_color: '#153E35',
      accent_color: '#EA580C',
      default_language: 'fr',
      supported_languages: ['fr', 'en', 'ar'],
      settings: {
        currency: 'MAD',
        taxRatePercent: 10,
        serviceFeePercent: 0,
        enableDineIn: true,
        enableTakeaway: true,
        enableDelivery: false,
        requireCustomerPhone: false,
        tableCount: 12
      },
      whatsapp_config: {
        enabled: true,
        destinationPhoneNumber: params.phone || '+212600000000',
        destinationName: 'Kitchen Dispatch',
        apiProvider: 'meta_cloud_api',
        templateName: 'sofraflow_order_notification_v1',
        templateLanguage: 'fr'
      },
      subscription_plan: 'starter',
      subscription_status: 'active'
    };

    let { data, error } = await supabase
      .from('restaurants')
      .insert(insertPayload)
      .select()
      .single();

    // If duplicate slug error, retry with randomized suffix
    if (error && (error.code === '23505' || error.message.includes('slug'))) {
      const fallbackSlug = `${cleanSlug}-${Math.random().toString(36).substring(2, 6)}`;
      insertPayload.slug = fallbackSlug;
      const retry = await supabase
        .from('restaurants')
        .insert(insertPayload)
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error('[Supabase] Error creating restaurant:', error.message);
      throw error;
    }

    return supabaseService.mapRestaurantRow(data);
  },

  async updateRestaurant(id: string, updates: Partial<Restaurant>): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    const payload: Record<string, any> = {};
    if (updates.name) payload.name = updates.name;
    if (updates.description) payload.description = updates.description;
    if (updates.phone) payload.phone = updates.phone;
    if (updates.city) payload.city = updates.city;
    if (updates.address) payload.address = updates.address;
    if (updates.logoUrl) payload.logo_url = updates.logoUrl;
    if (updates.coverImageUrl) payload.cover_image_url = updates.coverImageUrl;
    if (updates.settings) payload.settings = updates.settings;
    if (updates.whatsappConfig) payload.whatsapp_config = updates.whatsappConfig;

    const { error } = await supabase
      .from('restaurants')
      .update(payload)
      .eq('id', id);

    if (error) {
      console.error('[Supabase] Error updating restaurant:', error.message);
      return false;
    }
    return true;
  },

  // ------------------------------------------------------------------
  // 3. MENUS
  // ------------------------------------------------------------------
  async getMenusForRestaurant(restaurantId: string): Promise<Menu[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('menus')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Supabase] Error fetching menus:', error.message);
      return [];
    }

    return (data || []).map(m => ({
      id: m.id,
      restaurantId: m.restaurant_id,
      name: m.name,
      description: m.description || '',
      slug: m.slug,
      status: m.status || 'draft',
      categoryIds: [],
      productIds: [],
      enabledLanguages: ['fr', 'en', 'ar'],
      isDefault: m.is_default || false,
      updatedAt: m.updated_at
    }));
  },

  async createMenu(
    restaurantIdOrParams: string | {
      restaurantId: string;
      name: string;
      description?: string;
      slug?: string;
      templateId?: string;
      isPublished?: boolean;
      status?: 'draft' | 'published' | 'archived';
      is_default?: boolean;
      isDefault?: boolean;
      enabled_languages?: string[];
      enabledLanguages?: string[];
    },
    maybeParams?: {
      name: string;
      description?: string;
      slug?: string;
      templateId?: string;
      isPublished?: boolean;
      status?: 'draft' | 'published' | 'archived';
      is_default?: boolean;
      isDefault?: boolean;
      enabled_languages?: string[];
      enabledLanguages?: string[];
    }
  ): Promise<Menu | null> {
    if (!isSupabaseConfigured) return null;
    const restaurantId = typeof restaurantIdOrParams === 'string'
      ? restaurantIdOrParams
      : restaurantIdOrParams.restaurantId;
    const params = (maybeParams || (typeof restaurantIdOrParams === 'object' ? restaurantIdOrParams : {})) as any;

    const baseSlug = (params.slug || params.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'menu';

    const isPublished = params.isPublished ?? params.is_published ?? (params.status === 'published');
    const isDefault = params.isDefault ?? params.is_default ?? false;

    const { data, error } = await supabase
      .from('menus')
      .insert({
        restaurant_id: restaurantId,
        name: params.name,
        description: params.description || '',
        slug: params.slug || `${baseSlug}-${Date.now().toString(36)}`,
        template_id: params.templateId || 'template_modern_fine_dining',
        status: params.status || (isPublished ? 'published' : 'draft'),
        is_published: isPublished,
        is_default: isDefault
      })
      .select()
      .single();

    if (error) {
      console.error('[Supabase] Error creating menu:', error.message);
      throw error;
    }

    return {
      id: data.id,
      restaurantId: data.restaurant_id,
      name: data.name,
      description: data.description || '',
      slug: data.slug,
      status: data.status,
      categoryIds: [],
      productIds: [],
      enabledLanguages: params.enabledLanguages || params.enabled_languages || ['fr', 'en', 'ar'],
      isDefault: data.is_default,
      updatedAt: data.updated_at
    };
  },

  async updateMenu(
    menuId: string,
    updates: {
      name?: string;
      description?: string;
      slug?: string;
      status?: string;
      is_published?: boolean;
      isPublished?: boolean;
    }
  ): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    const payload: Record<string, any> = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.slug !== undefined) payload.slug = updates.slug;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.is_published !== undefined) payload.is_published = updates.is_published;
    if (updates.isPublished !== undefined) payload.is_published = updates.isPublished;

    const { error } = await supabase
      .from('menus')
      .update(payload)
      .eq('id', menuId);

    if (error) {
      console.error('[Supabase] Error updating menu:', error.message);
      return false;
    }
    return true;
  },

  async setMenuPublished(menuId: string, isPublished: boolean): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    const { error } = await supabase
      .from('menus')
      .update({
        is_published: isPublished,
        status: isPublished ? 'published' : 'draft'
      })
      .eq('id', menuId);

    if (error) {
      console.error('[Supabase] Error updating menu status:', error.message);
      return false;
    }
    return true;
  },

  async deleteMenu(menuId: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    const { error } = await supabase
      .from('menus')
      .delete()
      .eq('id', menuId);

    if (error) {
      console.error('[Supabase] Error deleting menu:', error.message);
      return false;
    }
    return true;
  },

  // ------------------------------------------------------------------
  // 4. CATEGORIES & PRODUCTS
  // ------------------------------------------------------------------
  async getCategoriesForRestaurant(restaurantId: string): Promise<MenuCategory[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('menu_categories')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('[Supabase] Error fetching categories:', error.message);
      return [];
    }

    return (data || []).map(c => ({
      id: c.id,
      restaurantId: c.restaurant_id,
      name: c.name as LocalizedString,
      description: c.description as LocalizedString | undefined,
      icon: c.icon || '',
      sortOrder: c.display_order
    }));
  },

  async createCategory(
    restaurantIdOrParams: string | {
      restaurantId: string;
      menuId?: string;
      name: LocalizedString;
      description?: LocalizedString;
      sortOrder?: number;
      sort_order?: number;
    },
    maybeParams?: {
      menuId?: string;
      name: LocalizedString;
      description?: LocalizedString;
      sortOrder?: number;
      sort_order?: number;
    }
  ): Promise<MenuCategory | null> {
    if (!isSupabaseConfigured) return null;
    const restaurantId = typeof restaurantIdOrParams === 'string'
      ? restaurantIdOrParams
      : restaurantIdOrParams.restaurantId;
    const params = (maybeParams || (typeof restaurantIdOrParams === 'object' ? restaurantIdOrParams : {})) as any;

    let menuId = params.menuId;
    if (!menuId) {
      const menus = await this.getMenusForRestaurant(restaurantId);
      menuId = menus[0]?.id;
    }

    if (!menuId) {
      const newMenu = await this.createMenu({
        restaurantId: restaurantId,
        name: 'Default Menu',
        isPublished: true
      });
      menuId = newMenu?.id;
    }

    const { data, error } = await supabase
      .from('menu_categories')
      .insert({
        restaurant_id: restaurantId,
        menu_id: menuId,
        name: params.name,
        description: params.description,
        display_order: params.sort_order ?? params.sortOrder ?? 0
      })
      .select()
      .single();

    if (error) {
      console.error('[Supabase] Error creating category:', error.message);
      throw error;
    }

    return {
      id: data.id,
      restaurantId: data.restaurant_id,
      name: data.name as LocalizedString,
      description: data.description as LocalizedString | undefined,
      icon: data.icon || '',
      sortOrder: data.display_order
    };
  },

  async deleteCategory(categoryId: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    const { error } = await supabase
      .from('menu_categories')
      .delete()
      .eq('id', categoryId);

    if (error) {
      console.error('[Supabase] Error deleting category:', error.message);
      return false;
    }
    return true;
  },

  async getProductsForRestaurant(restaurantId: string): Promise<Product[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('[Supabase] Error fetching items:', error.message);
      return [];
    }

    return (data || []).map(item => this.mapProductRow(item));
  },

  async createProduct(
    restaurantIdOrParams: string | {
      restaurantId: string;
      categoryId?: string;
      category_id?: string;
      menuId?: string;
      name: LocalizedString;
      description?: LocalizedString;
      price: number;
      currency?: string;
      imageUrl?: string;
      image_url?: string;
      isAvailable?: boolean;
      is_available?: boolean;
      dietaryTags?: any[];
      dietary_tags?: any[];
      dietary?: string;
      sortOrder?: number;
      sort_order?: number;
    },
    maybeParams?: {
      categoryId?: string;
      category_id?: string;
      menuId?: string;
      name: LocalizedString;
      description?: LocalizedString;
      price: number;
      currency?: string;
      imageUrl?: string;
      image_url?: string;
      isAvailable?: boolean;
      is_available?: boolean;
      dietaryTags?: any[];
      dietary_tags?: any[];
      dietary?: string;
      sortOrder?: number;
      sort_order?: number;
    }
  ): Promise<Product | null> {
    if (!isSupabaseConfigured) return null;
    const restaurantId = typeof restaurantIdOrParams === 'string'
      ? restaurantIdOrParams
      : restaurantIdOrParams.restaurantId;
    const params = (maybeParams || (typeof restaurantIdOrParams === 'object' ? restaurantIdOrParams : {})) as any;

    const categoryId = params.categoryId || params.category_id;
    let menuId = params.menuId;
    if (!menuId && categoryId) {
      const { data: cat } = await supabase
        .from('menu_categories')
        .select('menu_id')
        .eq('id', categoryId)
        .maybeSingle();
      menuId = cat?.menu_id;
    }

    const { data, error } = await supabase
      .from('menu_items')
      .insert({
        restaurant_id: restaurantId,
        category_id: categoryId,
        menu_id: menuId,
        name: params.name,
        description: params.description || { en: '', fr: '', ar: '' },
        price: params.price,
        currency: params.currency || 'MAD',
        image_url: params.image_url || params.imageUrl || '',
        is_available: params.is_available ?? params.isAvailable ?? true,
        dietary: (params.dietary as any) || (params.dietaryTags?.[0] as any) || null,
        dietary_tags: params.dietary_tags || params.dietaryTags || [],
        display_order: params.sort_order ?? params.sortOrder ?? 0
      })
      .select()
      .single();

    if (error) {
      console.error('[Supabase] Error creating product:', error.message);
      throw error;
    }

    return supabaseService.mapProductRow(data);
  },

  async updateProduct(
    productId: string,
    updates: {
      category_id?: string;
      name?: LocalizedString;
      description?: LocalizedString;
      price?: number;
      currency?: string;
      image_url?: string;
      is_available?: boolean;
      dietary_tags?: any[];
      sort_order?: number;
    }
  ): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    const payload: Record<string, any> = {};
    if (updates.category_id !== undefined) payload.category_id = updates.category_id;
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.price !== undefined) payload.price = updates.price;
    if (updates.currency !== undefined) payload.currency = updates.currency;
    if (updates.image_url !== undefined) payload.image_url = updates.image_url;
    if (updates.is_available !== undefined) payload.is_available = updates.is_available;
    if (updates.dietary_tags !== undefined) payload.dietary_tags = updates.dietary_tags;
    if (updates.sort_order !== undefined) payload.display_order = updates.sort_order;

    const { error } = await supabase
      .from('menu_items')
      .update(payload)
      .eq('id', productId);

    if (error) {
      console.error('[Supabase] Error updating product:', error.message);
      return false;
    }
    return true;
  },

  async deleteProduct(productId: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', productId);

    if (error) {
      console.error('[Supabase] Error deleting product:', error.message);
      return false;
    }
    return true;
  },

  // ------------------------------------------------------------------
  // 5. SMART QR & NFC SETTINGS
  // ------------------------------------------------------------------
  async getQrSettings(restaurantId: string): Promise<{
    id?: string;
    restaurantId: string;
    qrColor: string;
    includeLogo: boolean;
    wifiName: string;
    wifiPassword: string;
    tableNumber?: string;
    targetUrl?: string;
    label?: string;
    customColor?: string;
    showLogo?: boolean;
  } | null> {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase
      .from('qr_settings')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .maybeSingle();

    if (error) {
      console.error('[Supabase] Error fetching QR settings:', error.message);
      return null;
    }
    if (!data) return null;

    const color = data.qr_color || data.custom_color || '#153E35';
    const logo = data.include_logo ?? data.show_logo ?? true;

    return {
      id: data.id,
      restaurantId: data.restaurant_id,
      qrColor: color,
      customColor: color,
      includeLogo: logo,
      showLogo: logo,
      wifiName: data.wifi_name || '',
      wifiPassword: data.wifi_password || '',
      tableNumber: data.table_number || '',
      targetUrl: data.target_url || '',
      label: data.label || 'Table QR Code'
    };
  },

  async saveQrSettings(
    restaurantIdOrConfig: string | any,
    maybeSettings?: any
  ): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    const restaurantId = typeof restaurantIdOrConfig === 'string'
      ? restaurantIdOrConfig
      : restaurantIdOrConfig.restaurantId;
    const settings = maybeSettings || (typeof restaurantIdOrConfig === 'object' ? restaurantIdOrConfig : {});

    const color = settings.qrColor || settings.customColor || '#153E35';
    const logo = settings.includeLogo ?? settings.showLogo ?? true;

    const { error } = await supabase
      .from('qr_settings')
      .upsert(
        {
          restaurant_id: restaurantId,
          qr_color: color,
          custom_color: color,
          include_logo: logo,
          show_logo: logo,
          wifi_name: settings.wifiName || '',
          wifi_password: settings.wifiPassword || ''
        },
        { onConflict: 'restaurant_id' }
      );

    if (error) {
      console.error('[Supabase] Error saving QR settings:', error.message);
      return false;
    }
    return true;
  },

  // ------------------------------------------------------------------
  // 6. ORDERS
  // ------------------------------------------------------------------
  async getOrdersForRestaurant(restaurantId: string): Promise<Order[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Supabase] Error fetching orders:', error.message);
      return [];
    }

    return (data || []).map(o => ({
      id: o.id,
      publicOrderReference: o.public_order_reference,
      restaurantId: o.restaurant_id,
      orderType: o.order_type,
      tableNumber: o.table_number,
      customerName: o.customer_name,
      customerPhone: o.customer_phone,
      customerNotes: o.customer_notes,
      items: o.items || [],
      currency: o.currency || 'MAD',
      subtotal: Number(o.subtotal) || 0,
      taxAmount: Number(o.tax_amount) || 0,
      serviceFeeAmount: Number(o.service_fee_amount) || 0,
      total: Number(o.total) || 0,
      status: o.status,
      notificationStatus: o.notification_status,
      statusHistory: o.status_history || [],
      createdAt: o.created_at,
      updatedAt: o.updated_at
    }));
  },

  async createOrder(orderPayload: Partial<Order>): Promise<Order | null> {
    if (!isSupabaseConfigured) return null;
    const ref = orderPayload.publicOrderReference || `SF-${Math.floor(1000 + Math.random() * 9000)}`;

    const { data, error } = await supabase
      .from('orders')
      .insert({
        restaurant_id: orderPayload.restaurantId,
        public_order_reference: ref,
        order_type: orderPayload.orderType || 'dine_in',
        table_number: orderPayload.tableNumber,
        customer_name: orderPayload.customerName,
        customer_phone: orderPayload.customerPhone,
        customer_notes: orderPayload.customerNotes,
        items: orderPayload.items || [],
        currency: orderPayload.currency || 'MAD',
        subtotal: orderPayload.subtotal || 0,
        tax_amount: orderPayload.taxAmount || 0,
        service_fee_amount: orderPayload.serviceFeeAmount || 0,
        total: orderPayload.total || 0,
        status: 'new',
        notification_status: 'pending',
        status_history: [
          {
            status: 'new',
            timestamp: new Date().toISOString(),
            note: 'Order submitted by customer'
          }
        ]
      })
      .select()
      .single();

    if (error) {
      console.error('[Supabase] Error creating order:', error.message);
      throw error;
    }

    return {
      id: data.id,
      publicOrderReference: data.public_order_reference,
      restaurantId: data.restaurant_id,
      orderType: data.order_type,
      tableNumber: data.table_number,
      customerName: data.customer_name,
      customerPhone: data.customer_phone,
      customerNotes: data.customer_notes,
      items: data.items || [],
      currency: data.currency,
      subtotal: Number(data.subtotal),
      taxAmount: Number(data.tax_amount),
      serviceFeeAmount: Number(data.service_fee_amount),
      total: Number(data.total),
      status: data.status,
      notificationStatus: data.notification_status,
      statusHistory: data.status_history || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async updateOrderStatus(orderId: string, nextStatus: string, note?: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    const { error } = await supabase
      .from('orders')
      .update({
        status: nextStatus
      })
      .eq('id', orderId);

    if (error) {
      console.error('[Supabase] Error updating order status:', error.message);
      return false;
    }
    return true;
  },

  async getOrderById(orderId: string): Promise<Order | null> {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle();

      if (error || !data) {
        return null;
      }

      return {
        id: data.id,
        publicOrderReference: data.public_order_reference,
        restaurantId: data.restaurant_id,
        orderType: data.order_type,
        tableNumber: data.table_number,
        customerName: data.customer_name,
        customerPhone: data.customer_phone,
        customerNotes: data.customer_notes,
        items: data.items || [],
        currency: data.currency || 'MAD',
        subtotal: Number(data.subtotal) || 0,
        taxAmount: Number(data.tax_amount) || 0,
        serviceFeeAmount: Number(data.service_fee_amount) || 0,
        total: Number(data.total) || 0,
        status: data.status,
        notificationStatus: data.notification_status,
        statusHistory: data.status_history || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (err) {
      console.warn('[Supabase] getOrderById exception:', err);
      return null;
    }
  },

  async getOrderByReference(reference: string): Promise<Order | null> {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('public_order_reference', reference)
        .maybeSingle();

      if (error || !data) {
        return null;
      }

      return {
        id: data.id,
        publicOrderReference: data.public_order_reference,
        restaurantId: data.restaurant_id,
        orderType: data.order_type,
        tableNumber: data.table_number,
        customerName: data.customer_name,
        customerPhone: data.customer_phone,
        customerNotes: data.customer_notes,
        items: data.items || [],
        currency: data.currency || 'MAD',
        subtotal: Number(data.subtotal) || 0,
        taxAmount: Number(data.tax_amount) || 0,
        serviceFeeAmount: Number(data.service_fee_amount) || 0,
        total: Number(data.total) || 0,
        status: data.status,
        notificationStatus: data.notification_status,
        statusHistory: data.status_history || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (err) {
      console.warn('[Supabase] getOrderByReference exception:', err);
      return null;
    }
  },

  async getNotificationEvents(restaurantId: string): Promise<NotificationEvent[]> {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase
        .from('notification_events')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[Supabase] Error fetching notification events:', error.message);
        return [];
      }

      return (data || []).map(e => ({
        id: e.id,
        orderId: e.order_id,
        restaurantId: e.restaurant_id,
        destinationPhoneNumber: e.destination_phone_number,
        status: e.status,
        provider: e.provider,
        providerMessageId: e.provider_message_id,
        attemptCount: e.attempt_count,
        payloadSnapshot: e.payload_snapshot || {},
        errorMessage: e.error_message,
        createdAt: e.created_at,
        updatedAt: e.updated_at
      }));
    } catch (err) {
      console.warn('[Supabase] getNotificationEvents exception:', err);
      return [];
    }
  },

  async saveNotificationEvent(event: NotificationEvent): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    try {
      const { error } = await supabase
        .from('notification_events')
        .upsert({
          id: event.id,
          order_id: event.orderId,
          restaurant_id: event.restaurantId,
          destination_phone_number: event.destinationPhoneNumber,
          status: event.status,
          provider: event.provider,
          provider_message_id: event.providerMessageId || null,
          attempt_count: event.attemptCount || 1,
          payload_snapshot: event.payloadSnapshot || {},
          error_message: event.errorMessage || null,
          created_at: event.createdAt || new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.warn('[Supabase] Error saving notification event:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('[Supabase] saveNotificationEvent exception:', err);
      return false;
    }
  },

  async getBusinessSalesAnalytics(restaurantId: string): Promise<any | null> {
    if (!isSupabaseConfigured) return null;
    try {
      // Try database RPC function first
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_business_sales_analytics', {
        p_restaurant_id: restaurantId
      });

      if (!rpcError && rpcData) {
        return rpcData;
      }
    } catch (rpcEx) {
      console.warn('[Supabase] Analytics RPC exception:', rpcEx);
    }
    return null;
  },

  // ------------------------------------------------------------------
  // 7. SUBSCRIPTION PAYMENT REQUESTS
  // ------------------------------------------------------------------
  async getPaymentRequests(restaurantId?: string, isStaffOrAdmin: boolean = false): Promise<SubscriptionPaymentRequest[]> {
    if (!isSupabaseConfigured) return [];
    try {
      let query = supabase.from('subscription_payment_requests').select('*');
      if (restaurantId && !isStaffOrAdmin) {
        query = query.eq('restaurant_id', restaurantId);
      }
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) {
        console.warn('[Supabase] Error fetching payment requests:', error.message);
        return [];
      }
      return (data || []).map(r => this.mapPaymentRequestRow(r));
    } catch (e) {
      console.warn('[Supabase] getPaymentRequests exception:', e);
      return [];
    }
  },

  async createPaymentRequest(
    payload: Omit<SubscriptionPaymentRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>
  ): Promise<SubscriptionPaymentRequest | null> {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase
        .from('subscription_payment_requests')
        .insert({
          restaurant_id: payload.restaurantId,
          user_id: payload.userId,
          user_name: payload.userName,
          restaurant_name: payload.restaurantName,
          plan: payload.plan,
          billing_period: payload.billingPeriod,
          amount: payload.amount,
          currency: payload.currency || 'MAD',
          payment_method: payload.paymentMethod,
          transaction_reference: payload.transactionReference,
          receipt_url: payload.receiptUrl,
          receipt_file_name: payload.receiptFileName,
          payer_name: payload.payerName,
          payer_phone: payload.payerPhone,
          notes: payload.notes,
          status: 'under_review'
        })
        .select()
        .single();

      if (error) {
        console.error('[Supabase] Error creating payment request:', error.message);
        return null;
      }
      return this.mapPaymentRequestRow(data);
    } catch (e) {
      console.warn('[Supabase] createPaymentRequest exception:', e);
      return null;
    }
  },

  async updatePaymentRequestStatus(
    id: string,
    status: PaymentVerificationStatus,
    details?: { reason?: string; verifierId?: string }
  ): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    try {
      const payload: Record<string, any> = {
        status,
        updated_at: new Date().toISOString()
      };
      if (details?.reason !== undefined) payload.rejection_reason = details.reason;
      if (details?.verifierId !== undefined) payload.verified_by = details.verifierId;
      if (status === 'approved' || status === 'rejected') {
        payload.verified_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('subscription_payment_requests')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('[Supabase] Error updating payment request status:', error.message);
        return false;
      }

      // If approved, update the restaurant's subscription plan directly in Supabase
      if (status === 'approved' && data?.restaurant_id && data?.plan) {
        await supabase
          .from('restaurants')
          .update({
            subscription_plan: data.plan,
            subscription_status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('id', data.restaurant_id);
      }

      return true;
    } catch (e) {
      console.warn('[Supabase] updatePaymentRequestStatus exception:', e);
      return false;
    }
  },

  // ------------------------------------------------------------------
  // HELPER MAPPERS
  // ------------------------------------------------------------------
  mapRestaurantRow(r: any): Restaurant {
    const rawSettings = r.settings || {};
    const rawWhatsapp = r.whatsapp_config || {};

    return {
      id: r.id,
      name: r.name,
      slug: r.slug,
      description: r.description || '',
      address: r.address || '',
      city: r.city || 'Casablanca',
      country: r.country || 'Morocco',
      phone: r.phone || '',
      logoUrl: r.logo_url || '',
      coverImageUrl: r.cover_image_url || '',
      settings: {
        id: rawSettings.id || `set_${r.id}`,
        restaurantId: r.id,
        currency: rawSettings.currency || r.currency || 'MAD',
        taxRatePercent: rawSettings.taxRatePercent ?? 10,
        serviceFeePercent: rawSettings.serviceFeePercent ?? 0,
        enableDineIn: rawSettings.enableDineIn ?? true,
        enableTakeaway: rawSettings.enableTakeaway ?? true,
        enableDelivery: rawSettings.enableDelivery ?? false,
        requireCustomerPhone: rawSettings.requireCustomerPhone ?? false,
        tableCount: rawSettings.tableCount ?? 12,
        openingHours: rawSettings.openingHours || {},
        ...rawSettings
      },
      whatsappConfig: {
        restaurantId: r.id,
        enabled: rawWhatsapp.enabled ?? true,
        destinationPhoneNumber: rawWhatsapp.destinationPhoneNumber || r.phone || '',
        destinationName: rawWhatsapp.destinationName || 'Kitchen Dispatch',
        apiProvider: rawWhatsapp.apiProvider || 'meta_cloud_api',
        phoneNumberId: rawWhatsapp.phoneNumberId || '',
        wabaId: rawWhatsapp.wabaId || '',
        systemAccessToken: rawWhatsapp.systemAccessToken || '',
        templateName: rawWhatsapp.templateName || 'sofraflow_order_notification_v1',
        templateLanguage: rawWhatsapp.templateLanguage || 'fr',
        ...rawWhatsapp
      },
      subscriptionPlan: r.subscription_plan || 'starter',
      subscriptionStatus: r.subscription_status || 'active'
    };
  },

  mapProductRow(item: any): Product {
    return {
      id: item.id,
      restaurantId: item.restaurant_id,
      categoryId: item.category_id,
      name: item.name as LocalizedString,
      description: item.description as LocalizedString,
      price: Number(item.price) || 0,
      currency: item.currency || 'MAD',
      imageUrl: item.image_url || '',
      isAvailable: item.is_available ?? true,
      dietaryTags: item.dietary_tags || (item.dietary ? [item.dietary] : []),
      verifiedIngredients: item.verified_ingredients || [],
      verifiedAllergens: item.verified_allergens || [],
      optionGroups: item.option_groups || [],
      sortOrder: item.display_order || 0,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    };
  },

  mapPaymentRequestRow(r: any): SubscriptionPaymentRequest {
    return {
      id: r.id,
      restaurantId: r.restaurant_id,
      restaurantName: r.restaurant_name,
      userId: r.user_id,
      userName: r.user_name,
      plan: r.plan,
      billingPeriod: r.billing_period || 'monthly',
      amount: Number(r.amount),
      currency: r.currency || 'MAD',
      paymentMethod: r.payment_method,
      transactionReference: r.transaction_reference || '',
      receiptUrl: r.receipt_url,
      receiptFileName: r.receipt_file_name,
      status: r.status,
      rejectionReason: r.rejection_reason,
      payerName: r.payer_name,
      payerPhone: r.payer_phone,
      notes: r.notes,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      verifiedAt: r.verified_at,
      verifiedBy: r.verified_by
    };
  }
};
