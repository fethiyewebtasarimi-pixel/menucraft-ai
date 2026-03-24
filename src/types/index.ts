import type {
  Restaurant,
  Menu,
  Category,
  MenuItem,
  MenuItemVariant,
  MenuItemModifier,
  QRCode,
  Table,
  Order,
  OrderItem,
  Review,
  Analytics,
  Subscription,
  Branding,
  WorkingHour,
  SocialLink,
  User,
} from "@prisma/client";

// Extended types with relations
export type RestaurantWithRelations = Restaurant & {
  menus: Menu[];
  categories: CategoryWithItems[];
  branding: Branding | null;
  workingHours: WorkingHour[];
  socialLinks: SocialLink[];
  _count?: {
    menuItems: number;
    orders: number;
    reviews: number;
  };
};

export type CategoryWithItems = Category & {
  menuItems: MenuItemWithRelations[];
};

export type MenuItemWithRelations = MenuItem & {
  category: Category;
  variants: MenuItemVariant[];
  modifiers: MenuItemModifier[];
};

export type OrderWithRelations = Order & {
  items: (OrderItem & {
    menuItem: MenuItem;
  })[];
  table: Table | null;
};

export type MenuWithCategories = Menu & {
  categories: {
    category: CategoryWithItems;
    sortOrder: number;
  }[];
};

export type UserWithSubscription = User & {
  subscription: Subscription | null;
};

// API Response types
export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

// Dashboard Stats
export type DashboardStats = {
  totalMenuViews: number;
  totalQRScans: number;
  totalOrders: number;
  totalRevenue: number;
  menuViewsChange: number;
  qrScansChange: number;
  ordersChange: number;
  revenueChange: number;
};

// Cart types
export type CartItem = {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  notes?: string;
  modifiers?: Record<string, string>;
  variants?: { name: string; price: number };
};

// AI types
export type AIMenuAnalysisResult = {
  items: {
    name: string;
    description?: string;
    price: number;
    category: string;
    nameEn?: string;
  }[];
  categories: string[];
  currency?: string;
};

export type AIGeneratedDescription = {
  description: string;
  descriptionEn?: string;
};

// Plan limits
export type PlanLimits = {
  maxRestaurants: number;
  maxMenus: number;
  maxItems: number;
  aiCredits: number;
  languages: number;
  customQR: boolean;
  ordering: boolean;
  analytics: boolean;
  watermark: boolean;
};

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  FREE: {
    maxRestaurants: 1,
    maxMenus: 1,
    maxItems: 20,
    aiCredits: 5,
    languages: 1,
    customQR: false,
    ordering: false,
    analytics: false,
    watermark: true,
  },
  STARTER: {
    maxRestaurants: 1,
    maxMenus: 3,
    maxItems: 999999,
    aiCredits: 50,
    languages: 2,
    customQR: true,
    ordering: true,
    analytics: false,
    watermark: false,
  },
  PROFESSIONAL: {
    maxRestaurants: 3,
    maxMenus: 999999,
    maxItems: 999999,
    aiCredits: 200,
    languages: 999999,
    customQR: true,
    ordering: true,
    analytics: true,
    watermark: false,
  },
  ENTERPRISE: {
    maxRestaurants: 999999,
    maxMenus: 999999,
    maxItems: 999999,
    aiCredits: 999999,
    languages: 999999,
    customQR: true,
    ordering: true,
    analytics: true,
    watermark: false,
  },
};
