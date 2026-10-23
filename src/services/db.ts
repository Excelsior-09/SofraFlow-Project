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

// Seed Data
const SEED_RESTAURANTS: Restaurant[] = [
  {
    id: 'rest_marrakech_01',
    name: 'Le Jardin de Marrakech',
    slug: 'le-jardin',
    description: 'Authentic Moroccan hospitality, wood-fired tagines, and artisanal garden dining.',
    address: '32 Rue Sidi El Yamani, Medina',
    city: 'Marrakech',
    country: 'Morocco',
    phone: '+212 524 38 12 34',
    logoUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&auto=format&fit=crop&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&auto=format&fit=crop&q=80',
    settings: {
      id: 'settings_01',
      restaurantId: 'rest_marrakech_01',
      currency: 'MAD',
      taxRatePercent: 10,
      serviceFeePercent: 0,
      enableDineIn: true,
      enableTakeaway: true,
      enableDelivery: false,
      requireCustomerPhone: false,
      tableCount: 24,
      openingHours: {
        monday: { open: '12:00', close: '23:30', closed: false },
        tuesday: { open: '12:00', close: '23:30', closed: false },
        wednesday: { open: '12:00', close: '23:30', closed: false },
        thursday: { open: '12:00', close: '23:30', closed: false },
        friday: { open: '12:30', close: '00:00', closed: false },
        saturday: { open: '12:00', close: '00:00', closed: false },
        sunday: { open: '12:00', close: '23:30', closed: false }
      },
      customBrandColor: '#153E35'
    },
    whatsappConfig: {
      restaurantId: 'rest_marrakech_01',
      enabled: true,
      destinationPhoneNumber: '+212661234567',
      destinationName: 'Kitchen Order Printer & Dispatch',
      apiProvider: 'meta_cloud_api',
      phoneNumberId: '',
      wabaId: '',
      systemAccessToken: '',
      templateName: 'sofraflow_order_notification_v1',
      templateLanguage: 'fr',
      lastTestStatus: 'success',
      lastTestTimestamp: new Date(Date.now() - 3600000).toISOString()
    },
    subscriptionPlan: 'growth',
    subscriptionStatus: 'active'
  },
  {
    id: 'rest_casablanca_02',
    name: 'Café Atlas Artisan',
    slug: 'cafe-atlas',
    description: 'Modern specialty coffee, fresh Moroccan patisserie, and brunch bistro.',
    address: '14 Boulevard d’Anfa',
    city: 'Casablanca',
    country: 'Morocco',
    phone: '+212 522 99 88 77',
    logoUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200&auto=format&fit=crop&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&auto=format&fit=crop&q=80',
    settings: {
      id: 'settings_02',
      restaurantId: 'rest_casablanca_02',
      currency: 'MAD',
      taxRatePercent: 10,
      serviceFeePercent: 2.5,
      enableDineIn: true,
      enableTakeaway: true,
      enableDelivery: true,
      requireCustomerPhone: true,
      tableCount: 16,
      openingHours: {
        monday: { open: '08:00', close: '21:00', closed: false },
        tuesday: { open: '08:00', close: '21:00', closed: false },
        wednesday: { open: '08:00', close: '21:00', closed: false },
        thursday: { open: '08:00', close: '21:00', closed: false },
        friday: { open: '08:00', close: '22:00', closed: false },
        saturday: { open: '09:00', close: '22:00', closed: false },
        sunday: { open: '09:00', close: '20:00', closed: false }
      },
      customBrandColor: '#2B4A3F'
    },
    whatsappConfig: {
      restaurantId: 'rest_casablanca_02',
      enabled: true,
      destinationPhoneNumber: '+212662987654',
      destinationName: 'Front Counter Barista',
      apiProvider: 'meta_cloud_api',
      phoneNumberId: '',
      wabaId: '',
      systemAccessToken: '',
      templateName: 'sofraflow_order_notification_v1',
      templateLanguage: 'en_US'
    },
    subscriptionPlan: 'starter',
    subscriptionStatus: 'active'
  }
];

const SEED_CATEGORIES: MenuCategory[] = [
  {
    id: 'cat_starters_01',
    restaurantId: 'rest_marrakech_01',
    name: {
      en: 'Moroccan Starters & Salads',
      fr: 'Entrées & Salades Marocaines',
      ar: 'المقبلات والسلطات المغربية'
    },
    description: {
      en: 'Traditional chilled tapas and warm spiced appetisers.',
      fr: 'Assortiment de salades cuites traditionnelles et briouates.',
      ar: 'تشكيلة من السلطات التقليدية والمقبلات المغربية الشهية.'
    },
    sortOrder: 1
  },
  {
    id: 'cat_tagines_01',
    restaurantId: 'rest_marrakech_01',
    name: {
      en: 'Clay-Pot Tagines',
      fr: 'Tagines Traditionnels',
      ar: 'طواجن فخارية تقليدية'
    },
    description: {
      en: 'Slow-simmered over gentle embers with organic spices.',
      fr: 'Mijotés doucement au feu de braise avec nos épices artisanales.',
      ar: 'مطبوخة على نار هادئة بالفخار والتوابل المغربية الأصيلة.'
    },
    sortOrder: 2
  },
  {
    id: 'cat_couscous_01',
    restaurantId: 'rest_marrakech_01',
    name: {
      en: 'Royal Couscous & Pastilla',
      fr: 'Couscous & Pastillas',
      ar: 'الكسكس الملكي والبسطيلة'
    },
    description: {
      en: 'Seven-vegetable hand-rolled semolina and crispy phyllo pastilla.',
      fr: 'Semoule roulée à la main aux 7 légumes et pastillas croustillantes.',
      ar: 'سميد مفتول باليد مع سبع خضار وبسطيلة فاس العريقة.'
    },
    sortOrder: 3
  },
  {
    id: 'cat_drinks_01',
    restaurantId: 'rest_marrakech_01',
    name: {
      en: 'Moroccan Tea & Beverages',
      fr: 'Thé & Boissons Fraîches',
      ar: 'الشاي المغربي والمشروبات'
    },
    description: {
      en: 'Fresh mint tea ceremonies and cold pressed seasonal citrus.',
      fr: 'Thé à la menthe fraîche et jus de saison pressés minute.',
      ar: 'شاي أخضر بالنعناع الطازج وعصائر طبيعية منعشة.'
    },
    sortOrder: 4
  }
];

const SEED_PRODUCTS: Product[] = [
  {
    id: 'prod_zaalouk_01',
    restaurantId: 'rest_marrakech_01',
    categoryId: 'cat_starters_01',
    name: {
      en: 'Marrakech Trio Mezze (Zaalouk & Taktouka)',
      fr: 'Trio de Salades (Zaalouk, Taktouka & Carottes)',
      ar: 'ثلاثي المقبلات (زعلوك، تكتوكة، جزر مشرمل)'
    },
    description: {
      en: 'Roasted smoked eggplant zaalouk, sweet bell pepper taktouka, and cumin marinated carrots served with hot clay-oven bread.',
      fr: 'Aubergines fumées, poivrons marinés à la tomate et carottes au cumin, servis avec pain batbout chaud.',
      ar: 'باذنجان مدخن، فلفل حلو بالطماطم، وجزر بالكمون مع خبز الطين الطازج.'
    },
    price: 65,
    currency: 'MAD',
    imageUrl: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
    dietaryTags: ['vegetarian', 'vegan', 'halal'],
    verifiedIngredients: ['Eggplant', 'Tomatoes', 'Bell Peppers', 'Carrots', 'Garlic', 'Extra Virgin Olive Oil', 'Cumin', 'Coriander'],
    verifiedAllergens: ['Gluten (Bread only)'],
    optionGroups: [
      {
        id: 'opt_bread_01',
        title: { en: 'Bread Choice', fr: 'Choix de Pain', ar: 'نوع الخبز' },
        required: true,
        minSelections: 1,
        maxSelections: 1,
        choices: [
          { id: 'ch_batbout', name: { en: 'Warm Batbout (Clay Oven)', fr: 'Batbout Chaud Artisanal', ar: 'بطبوط سخون على العواد' }, priceModifier: 0 },
          { id: 'ch_glutenfree', name: { en: 'Gluten-Free Rice Galette', fr: 'Galette Sans Gluten', ar: 'خبز الأرز خالي من الغلوتين' }, priceModifier: 10 }
        ]
      }
    ],
    sortOrder: 1,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z'
  },
  {
    id: 'prod_briouates_02',
    restaurantId: 'rest_marrakech_01',
    categoryId: 'cat_starters_01',
    name: {
      en: 'Crispy Almond & Cheese Briouates (4 pcs)',
      fr: 'Briouates Croustillantes au Fromage de Chèvre (4 pcs)',
      ar: 'بريوات مقرمشة بجبن الماعز والزعتر (4 حبات)'
    },
    description: {
      en: 'Golden triangular phyllo pastries stuffed with Atlas goat cheese, wild thyme, and organic orange blossom honey.',
      fr: 'Feuilletés croustillants au chèvre frais de l’Atlas, thym sauvage et miel de fleur d’oranger.',
      ar: 'رقائق الورقة الذهبية المقرمشة محشوة بجبن أطلسي، زعتر بري وعسل حر.'
    },
    price: 75,
    currency: 'MAD',
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
    dietaryTags: ['vegetarian', 'halal', 'chef_special'],
    verifiedIngredients: ['Phyllo pastry', 'Atlas Goat Cheese', 'Wild Thyme', 'Orange Blossom Honey', 'Nigella Seeds'],
    verifiedAllergens: ['Dairy', 'Gluten'],
    optionGroups: [],
    sortOrder: 2,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z'
  },
  {
    id: 'prod_tagine_lamb_03',
    restaurantId: 'rest_marrakech_01',
    categoryId: 'cat_tagines_01',
    name: {
      en: 'Royal Lamb Tagine with Caramelized Prunes & Toasted Almonds',
      fr: 'Tagine d’Agneau aux Pruneaux Caramélisés & Amandes',
      ar: 'طاجين لحم الخروف الملكي بالبرقوق المعسل واللوز'
    },
    description: {
      en: 'Tender local lamb shank slow-braised for 4 hours with saffron, cinnamon bark, roasted sesame, and golden almonds.',
      fr: 'Souris d’agneau fondante mijotée 4h au safran de Taliouine, cannelle, pruneaux dorés et amandes torréfiées.',
      ar: 'لحم خروف طري مطهو ببطء مع زعفران تالوين، قرفة، سمسم محمص ولوز مقلي.'
    },
    price: 135,
    currency: 'MAD',
    imageUrl: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
    dietaryTags: ['halal', 'chef_special'],
    verifiedIngredients: ['Moroccan Lamb', 'Prunes', 'Taliouine Saffron', 'Toasted Almonds', 'Cinnamon', 'Sesame Seeds', 'Onions'],
    verifiedAllergens: ['Nuts (Almonds)', 'Sesame'],
    optionGroups: [
      {
        id: 'opt_lamb_side',
        title: { en: 'Side Preference', fr: 'Accompagnement', ar: 'المرافقة' },
        required: true,
        minSelections: 1,
        maxSelections: 1,
        choices: [
          { id: 'ch_tagine_bread', name: { en: 'Traditional Crusty Bread', fr: 'Pain de Campagne Marocain', ar: 'خبز الدار التقليدي' }, priceModifier: 0 },
          { id: 'ch_steamed_semolina', name: { en: 'Fine Steamed Saffron Couscous', fr: 'Semoule Fine au Safran', ar: 'كسكس رقيق بالزعفران' }, priceModifier: 15 }
        ]
      }
    ],
    sortOrder: 1,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z'
  },
  {
    id: 'prod_tagine_chicken_04',
    restaurantId: 'rest_marrakech_01',
    categoryId: 'cat_tagines_01',
    name: {
      en: 'Free-Range Chicken Tagine with Preserved Lemon & Meslalla Olives',
      fr: 'Tagine de Poulet Fermier au Citron Confit & Olives Meslalla',
      ar: 'طاجين دجاج بلدي بالحامض المصير وزيتون المسلالة'
    },
    description: {
      en: 'Farm-raised chicken infused with ginger, coriander, slow preserved lemons, and purple cracked olives.',
      fr: 'Poulet fermier mijoté au gingembre frais, coriandre, citrons confits traditionnels et olives violettes.',
      ar: 'دجاج بلدي بالتوابل المغربية، سكينجبير، حامض بلدي معتق وزيتون مفرشخ.'
    },
    price: 110,
    currency: 'MAD',
    imageUrl: 'https://images.unsplash.com/photo-1584927237000-58d0c24207f2?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
    dietaryTags: ['halal'],
    verifiedIngredients: ['Free-Range Chicken', 'Preserved Lemons', 'Meslalla Olives', 'Ginger', 'Turmeric', 'Garlic', 'Coriander'],
    verifiedAllergens: [],
    optionGroups: [],
    sortOrder: 2,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z'
  },
  {
    id: 'prod_pastilla_05',
    restaurantId: 'rest_marrakech_01',
    categoryId: 'cat_couscous_01',
    name: {
      en: 'Fassi Chicken Pastilla (Almond & Cinnamon)',
      fr: 'Pastilla Fassie Traditionnelle au Poulet & Amandes',
      ar: 'بسطيلة فاس العريقة بالدجاج واللوز'
    },
    description: {
      en: 'The crown jewel of Moroccan cuisine: shredded spiced chicken, egg-onion sauce, crushed almonds, iced sugar, and cinnamon.',
      fr: 'Feuilles de ouarka dorées, effiloché de volaille épicée, confit d’oignons, amandes pilées, cannelle et sucre glace.',
      ar: 'ورقة مقرمشة، دجاج متبل، بيض بالبصل المعسل، لوز مهرمش، قرفة وسكر صقيل.'
    },
    price: 120,
    currency: 'MAD',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
    dietaryTags: ['halal', 'chef_special'],
    verifiedIngredients: ['Chicken', 'Warqa Pastry', 'Almonds', 'Eggs', 'Orange Blossom Water', 'Cinnamon', 'Powdered Sugar'],
    verifiedAllergens: ['Nuts (Almonds)', 'Eggs', 'Gluten'],
    optionGroups: [],
    sortOrder: 1,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z'
  },
  {
    id: 'prod_tea_06',
    restaurantId: 'rest_marrakech_01',
    categoryId: 'cat_drinks_01',
    name: {
      en: 'Traditional Moroccan Mint Tea (Silver Teapot)',
      fr: 'Thé Traditionnel à la Menthe Fraîche (Théière)',
      ar: 'براد أتاي مغربي مشحر بالنعناع والرزة'
    },
    description: {
      en: 'Gunpowder green tea infused with fresh garden spearmint and served high in the authentic ceremonial style.',
      fr: 'Thé vert gunpowder infusé à la menthe douce fraîche et versé à la marocaine.',
      ar: 'شاي أخضر أصيل بالنعناع الطري مقدّم في البراد الفضي مع الرزة.'
    },
    price: 30,
    currency: 'MAD',
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
    dietaryTags: ['vegetarian', 'vegan', 'halal'],
    verifiedIngredients: ['Gunpowder Green Tea', 'Fresh Garden Mint (Naana)', 'Spring Water', 'Sugar'],
    verifiedAllergens: [],
    optionGroups: [
      {
        id: 'opt_sugar_level',
        title: { en: 'Sweetness', fr: 'Niveau de Sucre', ar: 'درجة الحلاوة' },
        required: true,
        minSelections: 1,
        maxSelections: 1,
        choices: [
          { id: 'ch_sugar_med', name: { en: 'Medium (Traditional)', fr: 'Moyen (Traditionnel)', ar: 'حلاوة معتدلة (أصلي)' }, priceModifier: 0 },
          { id: 'ch_sugar_none', name: { en: 'No Sugar (Bila Soukar)', fr: 'Sans Sucre', ar: 'بدون سكر' }, priceModifier: 0 },
          { id: 'ch_sugar_extra', name: { en: 'Sweet (Marrakchi)', fr: 'Bien Sucré', ar: 'حلو على الطريقة المراكشية' }, priceModifier: 0 }
        ]
      }
    ],
    sortOrder: 1,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z'
  }
];

const SEED_MENUS: Menu[] = [
  {
    id: 'menu_main_01',
    restaurantId: 'rest_marrakech_01',
    name: 'Lunch & Dinner Garden Menu',
    description: 'Our complete seasonal dining experience in the courtyard.',
    slug: 'main',
    status: 'published',
    categoryIds: ['cat_starters_01', 'cat_tagines_01', 'cat_couscous_01', 'cat_drinks_01'],
    productIds: ['prod_zaalouk_01', 'prod_briouates_02', 'prod_tagine_lamb_03', 'prod_tagine_chicken_04', 'prod_pastilla_05', 'prod_tea_06'],
    enabledLanguages: ['en', 'fr', 'ar'],
    isDefault: true,
    updatedAt: '2026-01-15T12:00:00Z'
  }
];

const SEED_ORDERS: Order[] = [
  {
    id: 'ord_sample_01',
    publicOrderReference: 'SF-4912',
    restaurantId: 'rest_marrakech_01',
    orderType: 'dine_in',
    tableNumber: '4',
    customerName: 'Yassine El Amrani',
    customerPhone: '+212611223344',
    customerNotes: 'Please bring mint tea after the tagine.',
    items: [
      {
        productId: 'prod_tagine_lamb_03',
        productName: { en: 'Royal Lamb Tagine with Prunes', fr: 'Tagine d’Agneau aux Pruneaux', ar: 'طاجين لحم الخروف الملكي بالبرقوق' },
        unitPrice: 135,
        quantity: 2,
        selectedOptions: [{ groupId: 'opt_lamb_side', groupTitle: 'Side Preference', choiceId: 'ch_tagine_bread', choiceName: 'Traditional Crusty Bread', priceModifier: 0 }],
        subtotal: 270
      },
      {
        productId: 'prod_tea_06',
        productName: { en: 'Traditional Moroccan Mint Tea', fr: 'Thé à la Menthe Fraîche', ar: 'شاي مغربي بالنعناع' },
        unitPrice: 30,
        quantity: 2,
        selectedOptions: [{ groupId: 'opt_sugar_level', groupTitle: 'Sweetness', choiceId: 'ch_sugar_med', choiceName: 'Medium', priceModifier: 0 }],
        subtotal: 60
      }
    ],
    currency: 'MAD',
    subtotal: 330,
    taxAmount: 33,
    serviceFeeAmount: 0,
    total: 363,
    status: 'preparing',
    notificationStatus: 'delivered',
    notificationEventId: 'notif_seed_01',
    statusHistory: [
      { status: 'new', timestamp: '2026-10-19T21:30:00Z' },
      { status: 'confirmed', timestamp: '2026-10-19T21:32:00Z', note: 'Kitchen accepted' },
      { status: 'preparing', timestamp: '2026-10-19T21:35:00Z', note: 'Lamb tagine placed on charcoal stove' }
    ],
    createdAt: '2026-10-19T21:30:00Z',
    updatedAt: '2026-10-19T21:35:00Z'
  },
  {
    id: 'ord_sample_02',
    publicOrderReference: 'SF-4913',
    restaurantId: 'rest_marrakech_01',
    orderType: 'takeaway',
    customerName: 'Sophie Bernard',
    customerPhone: '+212677889900',
    customerNotes: 'Packaging for hotel delivery pickup please.',
    items: [
      {
        productId: 'prod_pastilla_05',
        productName: { en: 'Fassi Chicken Pastilla', fr: 'Pastilla Fassie au Poulet', ar: 'بسطيلة فاس العريقة بالدجاج' },
        unitPrice: 120,
        quantity: 1,
        selectedOptions: [],
        subtotal: 120
      },
      {
        productId: 'prod_zaalouk_01',
        productName: { en: 'Marrakech Trio Mezze', fr: 'Trio de Salades', ar: 'ثلاثي المقبلات' },
        unitPrice: 65,
        quantity: 1,
        selectedOptions: [{ groupId: 'opt_bread_01', groupTitle: 'Bread Choice', choiceId: 'ch_batbout', choiceName: 'Batbout Chaud', priceModifier: 0 }],
        subtotal: 65
      }
    ],
    currency: 'MAD',
    subtotal: 185,
    taxAmount: 18.5,
    serviceFeeAmount: 0,
    total: 203.5,
    status: 'new',
    notificationStatus: 'delivered',
    notificationEventId: 'notif_seed_02',
    statusHistory: [
      { status: 'new', timestamp: '2026-10-19T22:15:00Z' }
    ],
    createdAt: '2026-10-19T22:15:00Z',
    updatedAt: '2026-10-19T22:15:00Z'
  },
  {
    id: 'ord_sample_03',
    publicOrderReference: 'SF-4890',
    restaurantId: 'rest_marrakech_01',
    orderType: 'dine_in',
    tableNumber: '11',
    customerName: 'Karim Tazi',
    customerPhone: '+212650112233',
    items: [
      {
        productId: 'prod_tagine_chicken_04',
        productName: { en: 'Free-Range Chicken Tagine', fr: 'Tagine de Poulet Fermier', ar: 'طاجين دجاج بلدي' },
        unitPrice: 110,
        quantity: 3,
        selectedOptions: [],
        subtotal: 330
      }
    ],
    currency: 'MAD',
    subtotal: 330,
    taxAmount: 33,
    serviceFeeAmount: 0,
    total: 363,
    status: 'completed',
    notificationStatus: 'delivered',
    notificationEventId: 'notif_seed_03',
    statusHistory: [
      { status: 'new', timestamp: '2026-10-19T19:00:00Z' },
      { status: 'confirmed', timestamp: '2026-10-19T19:02:00Z' },
      { status: 'preparing', timestamp: '2026-10-19T19:05:00Z' },
      { status: 'ready', timestamp: '2026-10-19T19:35:00Z' },
      { status: 'completed', timestamp: '2026-10-19T20:20:00Z', note: 'Paid in cash at table' }
    ],
    createdAt: '2026-10-19T19:00:00Z',
    updatedAt: '2026-10-19T20:20:00Z'
  }
];

const SEED_USER: User = {
  id: 'usr_owner_01',
  email: 'owner@sofraflow.com',
  fullName: 'Tariq Benjelloun',
  restaurantId: 'rest_marrakech_01',
  role: 'owner'
};

class SafeStorage {
  private memory: Record<string, string> = {};
  getItem(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {}
    return this.memory[key] ?? null;
  }
  setItem(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch (e) {}
    this.memory[key] = value;
  }
  removeItem(key: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
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
      appStorage.setItem(STORAGE_KEYS.RESTAURANTS, JSON.stringify(SEED_RESTAURANTS));
    }
    if (!appStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      appStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(SEED_CATEGORIES));
    }
    if (!appStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      appStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(SEED_PRODUCTS));
    }
    if (!appStorage.getItem(STORAGE_KEYS.MENUS)) {
      appStorage.setItem(STORAGE_KEYS.MENUS, JSON.stringify(SEED_MENUS));
    }
    if (!appStorage.getItem(STORAGE_KEYS.ORDERS)) {
      appStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(SEED_ORDERS));
    }
    if (!appStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      appStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(SEED_USER));
    }
    if (!appStorage.getItem(STORAGE_KEYS.ACTIVE_RESTAURANT_ID)) {
      appStorage.setItem(STORAGE_KEYS.ACTIVE_RESTAURANT_ID, 'rest_marrakech_01');
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
  public getRestaurants(): Restaurant[] {
    const data = appStorage.getItem(STORAGE_KEYS.RESTAURANTS);
    return data ? JSON.parse(data) : [];
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

  public getActiveRestaurantId(): string {
    return appStorage.getItem(STORAGE_KEYS.ACTIVE_RESTAURANT_ID) || 'rest_marrakech_01';
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
    appStorage.setItem(STORAGE_KEYS.ACTIVE_RESTAURANT_ID, 'rest_marrakech_01');
    appStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    appStorage.removeItem(STORAGE_KEYS.PAYMENT_REQUESTS);
    this.notify();
  }
}

export const db = new DatabaseService();
