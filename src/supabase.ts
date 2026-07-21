import { createClient } from '@supabase/supabase-js';

// Try to load env variables (Vite-specific)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Determine if we should use Mock/Demo Mode
export const isDemoMode = !supabaseUrl || !supabaseAnonKey || supabaseUrl === 'YOUR_SUPABASE_URL' || localStorage.getItem('kobowise_use_demo_mode') === 'true';

console.log(
  isDemoMode 
    ? 'KoboWise: Running in DEMO MODE (Local Database)' 
    : 'KoboWise: Running in LIVE MODE (Supabase Database)'
);

// Initialize real client if keys are available
export const supabase = !isDemoMode ? createClient(supabaseUrl, supabaseAnonKey) : null;

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Profile {
  id: string;
  role: 'buyer' | 'trader';
  full_name: string;
  student_id?: string;
  phone_number: string;
  avatar_url?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

export interface Product {
  id: string;
  trader_id: string;
  category_id: string;
  name: string;
  description: string;
  shares_per_person?: string;
  total_price: number;
  total_shares: number;
  price_per_share: number;
  stock_quantity: number;
  estimated_delivery: string;
  pickup_location: string;
  status: 'active' | 'completed' | 'cancelled';
  image_url: string;
  trader_name?: string;
}

export interface GroupOrder {
  id: string;
  product_id: string;
  shares_purchased: number;
  shares_needed: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  product?: Product;
}

export interface OrderItem {
  id: string;
  group_order_id: string;
  buyer_id: string;
  shares_bought: number;
  price_paid: number;
  buyer_name?: string;
  created_at: string;
}

export interface Order {
  id: string;
  buyer_id: string;
  group_order_id: string;
  shares_bought: number;
  total_price: number;
  status: 'paid' | 'processing' | 'ready_for_pickup' | 'delivered' | 'cancelled';
  payment_method: string;
  payment_reference: string;
  created_at: string;
  product_name?: string;
  trader_name?: string;
  buyer_name?: string;
  estimated_delivery?: string;
  pickup_location?: string;
}

export interface Review {
  id: string;
  product_id: string;
  buyer_id: string;
  buyer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface TraderWaitlistEntry {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  campus: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

/**
 * Generates a unique order number starting with 3 random uppercase letters
 * followed by 10 random numbers (e.g., KBW8392017465, DEL9182736450).
 */
export function generateUniqueOrderNumber(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let prefix = '';
  for (let i = 0; i < 3; i++) {
    prefix += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  let digits = '';
  for (let i = 0; i < 10; i++) {
    digits += Math.floor(Math.random() * 10).toString();
  }
  return `${prefix}${digits}`;
}

// ============================================================================
// MOCK BACKEND DATA SEEDING
// ============================================================================

const MOCK_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Food Staples', slug: 'food-staples', icon: 'Utensils' },
  { id: 'cat-2', name: 'Cooking Essentials', slug: 'cooking-essentials', icon: 'Flame' },
  { id: 'cat-4', name: 'Beverages', slug: 'beverages', icon: 'CupSoda' },
  { id: 'cat-5', name: 'Dairy', slug: 'dairy', icon: 'Milk' },
  { id: 'cat-6', name: 'Snacks', slug: 'snacks', icon: 'Cookie' },
  { id: 'cat-7', name: 'Fruits & Vegetables', slug: 'fruits-vegetables', icon: 'Apple' },
  { id: 'cat-8', name: 'Personal Care', slug: 'personal-care', icon: 'Sparkles' },
  { id: 'cat-9', name: 'Laundry & Cleaning', slug: 'laundry-cleaning', icon: 'Wind' },
  { id: 'cat-10', name: 'Student Essentials', slug: 'student-essentials', icon: 'BookOpen' }
];

const MOCK_PROFILES: Profile[] = [
  { id: 'trader-1', role: 'trader', full_name: 'KoboWise Store', phone_number: '08031112222' },
  { id: 'buyer-1', role: 'buyer', full_name: 'Omologe Evans', student_id: 'FOS/22/23/287502', phone_number: '08123456789' }
];

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    trader_id: 'trader-1',
    category_id: 'cat-1',
    name: 'Bag of Garri',
    description: 'Freshly processed Abraka garri. Dry, crunchy, and perfect for drinking or making Eba. Split into 4 baskets per buyer.',
    shares_per_person: '4 Basket',
    total_price: 18000,
    total_shares: 4,
    price_per_share: 4500,
    stock_quantity: 30,
    estimated_delivery: 'Same Day Delivery',
    pickup_location: 'DELSU Site II Gate Shop 1B',
    status: 'active',
    image_url: '/images/Garri.png'
  },
  {
    id: 'prod-2',
    trader_id: 'trader-1',
    category_id: 'cat-1',
    name: 'Indomie Super Pack Carton (40 Packs)',
    description: 'Carton of Indomie Belle Full (120g). A student staple at DELSU. Buy a share and get 10 packs instead of paying for a whole carton.',
    shares_per_person: '10 Packs',
    total_price: 24000,
    total_shares: 4,
    price_per_share: 6000,
    stock_quantity: 30,
    estimated_delivery: '1-2 Days',
    pickup_location: 'DELSU Site II Gate Shop 1B',
    status: 'active',
    image_url: '/images/Indomie.jpg'
  },
  {
    id: 'prod-3',
    trader_id: 'trader-1',
    category_id: 'cat-10',
    name: 'Family Bread',
    description: 'Family size bread, Freshly baked, Soft, and delicious. Perfect for sharing with friends and family.',
    shares_per_person: 'Family Size Bread',
    total_price: 1200,
    total_shares: 2,
    price_per_share: 600,
    stock_quantity: 30,
    estimated_delivery: 'Same Day Pickup',
    pickup_location: 'DELSU Site II Gate Shop 1B',
    status: 'active',
    image_url: '/images/Bread.png'
  },
  {
    id: 'prod-4',
    trader_id: 'trader-1',
    category_id: 'cat-2',
    name: 'Devon King\'s Vegetable Oil (5L)',
    description: 'Premium healthy cooking oil. No cholesterol. Perfect for frying plantain and making Jollof rice in the hostel.',
    shares_per_person: '2.5 Litres',
    total_price: 3450,
    total_shares: 2,
    price_per_share: 1725,
    stock_quantity: 30,
    estimated_delivery: 'Same Day Pickup',
    pickup_location: 'DELSU Site II Gate Shop 1B',
    status: 'active',
    image_url: '/images/Groundnut oil.png'
  },
  {
    id: 'prod-5',
    trader_id: 'trader-1',
    category_id: 'cat-10',
    name: '80 Leaves Notebook Pack',
    description: 'A Dozen (12) 80-leaves exercise books for assignments and lectures. High quality pages.',
    shares_per_person: '12 Notebooks',
    total_price: 6000,
    total_shares: 1,
    price_per_share: 5600,
    stock_quantity: 30,
    estimated_delivery: 'Immediate Pickup',
    pickup_location: 'DELSU Site II Gate Shop 1B',
    status: 'active',
    image_url: '/images/Notebook.jfif'
  },
  {
    id: 'prod-6',
    trader_id: 'trader-1',
    category_id: 'cat-1',
    name: 'Crate of Eggs',
    description: 'Fresh Grade A Chicken Eggs. Clean, undamaged, and perfect for boiling, baking, or omelettes. Delivered uncracked.',
    shares_per_person: '7 Eggs',
    total_price: 5600,
    total_shares: 4,
    price_per_share: 1400,
    stock_quantity: 30,
    estimated_delivery: '1 Day Delivery',
    pickup_location: 'DELSU Site II Gate Shop 1B',
    status: 'active',
    image_url: '/images/Eggs.png'
  },
  {
    id: 'prod-7',
    trader_id: 'trader-1',
    category_id: 'cat-1',
    name: 'Bag of rice',
    description: 'High-quality parboiled local rice. Stone-free, easy to cook, and perfect for household and hostel cooking. Split with others to get a share.',
    shares_per_person: '1 Basket',
    total_price: 32000,
    total_shares: 4,
    price_per_share: 8000,
    stock_quantity: 30,
    estimated_delivery: 'Same Day Delivery',
    pickup_location: 'DELSU Site II Gate Shop 1B',
    status: 'active',
    image_url: '/images/Bag of rice.png'
  },
  {
    id: 'prod-8',
    trader_id: 'trader-1',
    category_id: 'cat-4',
    name: 'Milo',
    description: 'Nestlé Milo chocolate malt beverage. Provides essential nutrients and energy for active students. carton split.',
    shares_per_person: '25 Milo Sachets',
    total_price: 16000,
    total_shares: 4,
    price_per_share: 4000,
    stock_quantity: 30,
    estimated_delivery: 'Same Day Delivery',
    pickup_location: 'DELSU Site II Gate Shop 1B',
    status: 'active',
    image_url: '/images/Milo.png'
  },
  {
    id: 'prod-9',
    trader_id: 'trader-1',
    category_id: 'cat-1',
    name: 'Beans',
    description: 'Premium quality brown beans. High in protein, clean, and quick-cooking. Ideal for making Akara, Moi-Moi, or eating with plantain.',
    shares_per_person: '1 Basket',
    total_price: 18000,
    total_shares: 4,
    price_per_share: 4500,
    stock_quantity: 30,
    estimated_delivery: '1-2 Days',
    pickup_location: 'DELSU Site II Gate Shop 1B',
    status: 'active',
    image_url: '/images/Beans.png'
  },
  {
    id: 'prod-10',
    trader_id: 'trader-1',
    category_id: 'cat-1',
    name: 'Macroni',
    description: 'Golden Penny Macaroni. Delicious pasta that cooks in minutes. Split a carton of 20 packs.',
    shares_per_person: '10 Packs',
    total_price: 11000,
    total_shares: 2,
    price_per_share: 5500,
    stock_quantity: 30,
    estimated_delivery: 'Same Day Pickup',
    pickup_location: 'DELSU Site III Gate Shop 1A',
    status: 'active',
    image_url: '/images/Macroni.png'
  },
  {
    id: 'prod-11',
    trader_id: 'trader-1',
    category_id: 'cat-2',
    name: 'Maggi',
    description: 'Maggi seasoning cubes. Perfect seasoning for all your home-cooked stews, soups, and dishes.',
    shares_per_person: '30 Cubes',
    total_price: 3000,
    total_shares: 3,
    price_per_share: 1000,
    stock_quantity: 30,
    estimated_delivery: '1-2 Days',
    pickup_location: 'DELSU Site II Gate Shop 1B',
    status: 'active',
    image_url: '/images/Maggi.png'
  },
  {
    id: 'prod-12',
    trader_id: 'trader-1',
    category_id: 'cat-5',
    name: 'Milk',
    description: 'Dano Full Cream Milk powder. Creamy, rich, and highly soluble. Buy a share of the carton.',
    shares_per_person: '2.5 Sachets',
    total_price: 12000,
    total_shares: 4,
    price_per_share: 3000,
    stock_quantity: 30,
    estimated_delivery: 'Same Day Pickup',
    pickup_location: 'DELSU Site II Gate Shop 1B',
    status: 'active',
    image_url: '/images/Milk.png'
  },
  {
    id: 'prod-13',
    trader_id: 'trader-1',
    category_id: 'cat-2',
    name: '1L of oil',
    description: '1 Litre of pure premium vegetable cooking oil. Healthy, cholesterol free, and perfect for frying and cooking.',
    shares_per_person: '1 Litre',
    total_price: 2400,
    total_shares: 1,
    price_per_share: 2400,
    stock_quantity: 30,
    estimated_delivery: 'Same Day Delivery',
    pickup_location: 'DELSU Site II Gate Shop 1B',
    status: 'active',
    image_url: '/images/1L of oil.png'
  },
  {
    id: 'prod-14',
    trader_id: 'trader-1',
    category_id: 'cat-1',
    name: 'sugar-1',
    description: 'Fine granulated white sugar. Essential sweetener for your beverages, cereals, and baking needs.',
    shares_per_person: '1 Pack',
    total_price: 1500,
    total_shares: 1,
    price_per_share: 1500,
    stock_quantity: 30,
    estimated_delivery: 'Same Day Pickup',
    pickup_location: 'DELSU Site II Gate Shop 1B',
    status: 'active',
    image_url: '/images/sugar-1.webp'
  },
  {
    id: 'prod-15',
    trader_id: 'trader-1',
    category_id: 'cat-6',
    name: 'Minimie Chinchin Carton (40 Packs)',
    description: 'Crunchy Minimie chinchin carton. Tasty, convenient snack. Share the carton with 3 other students and get 10 packs each.',
    shares_per_person: '10 Packs',
    total_price: 8000,
    total_shares: 4,
    price_per_share: 2000,
    stock_quantity: 30,
    estimated_delivery: '1 Day Delivery',
    pickup_location: 'DELSU Site II Gate Shop 1B',
    status: 'active',
    image_url: '/images/chinchin.jfif'
  },
  {
    id: 'prod-16',
    trader_id: 'trader-1',
    category_id: 'cat-1',
    name: 'GoldenMorn',
    description: 'Golden Morn nutritious maize cereal. Packed with key vitamins and minerals. Perfect breakfast choice.',
    shares_per_person: '5 Packs',
    total_price: 15000,
    total_shares: 2,
    price_per_share: 7500,
    stock_quantity: 30,
    estimated_delivery: 'Same Day Pickup',
    pickup_location: 'DELSU Site II Gate Shop 1B',
    status: 'active',
    image_url: '/images/GoldenMorn.png'
  },
  {
    id: 'prod-17',
    trader_id: 'trader-1',
    category_id: 'cat-7',
    name: 'tomatoes',
    description: 'Fresh locally harvested plum tomatoes. Sweet, firm, and excellent for all your stew and soup preparations.',
    shares_per_person: '1/3 Basket',
    total_price: 12000,
    total_shares: 3,
    price_per_share: 4000,
    stock_quantity: 30,
    estimated_delivery: 'Same Day Delivery',
    pickup_location: 'DELSU Site II Gate Shop 1B',
    status: 'active',
    image_url: '/images/tomatoes.png'
  },
  {
    id: 'prod-18',
    trader_id: 'trader-1',
    category_id: 'cat-7',
    name: 'yams',
    description: 'Fresh sweet yams, sourced directly from local farms. Great for boiling, frying, or making pounded yam.',
    shares_per_person: '2 Tubers',
    total_price: 8000,
    total_shares: 2,
    price_per_share: 4000,
    stock_quantity: 30,
    estimated_delivery: '1 Day Delivery',
    pickup_location: 'DELSU Site III Gate Shop 1A',
    status: 'active',
    image_url: '/images/yams.png'
  },
  {
    id: 'prod-19',
    trader_id: 'trader-1',
    category_id: 'cat-1',
    name: 'Kellogg\'s Corn Flakes (Pack of 2)',
    description: 'Crispy, delicious, and toasted corn flakes. Perfect morning breakfast for students. Split a pack of 2 with another student.',
    shares_per_person: '1 Pack',
    total_price: 5000,
    total_shares: 2,
    price_per_share: 2500,
    stock_quantity: 30,
    estimated_delivery: 'Same Day Pickup',
    pickup_location: 'DELSU Site II Gate Shop 1B',
    status: 'active',
    image_url: '/images/cornflakes.png'
  },
  {
    id: 'prod-20',
    trader_id: 'trader-1',
    category_id: 'cat-8',
    name: 'Dettol Cool Soap (Pack of 12)',
    description: 'Refreshing Dettol soap pack with menthol. Offers maximum protection and keeps you cool under the Abraka sun.',
    shares_per_person: '4 Soap Bars',
    total_price: 3150,
    total_shares: 3,
    price_per_share: 1050,
    stock_quantity: 30,
    estimated_delivery: 'Immediate Pickup',
    pickup_location: 'DELSU Site II Gate Shop 1B',
    status: 'active',
    image_url: '/images/Dettol.jpg'
  },
  {
    id: 'prod-21',
    trader_id: 'trader-1',
    category_id: 'cat-8',
    name: 'Close Up Toothpaste Triple Pack (Pack of 10)',
    description: 'Micro-shine gel toothpaste for fresh breath and white teeth. Stock up for the semester at student group prices.',
    shares_per_person: '5 Triple Packs',
    total_price: 8000,
    total_shares: 2,
    price_per_share: 4000,
    stock_quantity: 30,
    estimated_delivery: 'Same Day Pickup',
    pickup_location: 'DELSU Site II Gate Shop 1B',
    status: 'active',
    image_url: '/images/closeup.jfif'
  },
  {
    id: 'prod-22',
    trader_id: 'trader-1',
    category_id: 'cat-1',
    name: 'Golden Penny Spaghetti',
    description: 'Tasty, non-sticky Golden Penny spaghetti. Perfect fast-cooking meal for students. Split a carton of 20 packs with 3 other students and get 5 packs each.',
    shares_per_person: '5 Packs',
    total_price: 16000,
    total_shares: 4,
    price_per_share: 4000,
    stock_quantity: 30,
    estimated_delivery: 'Same Day Pickup',
    pickup_location: 'DELSU Site II Gate Shop 1B',
    status: 'active',
    image_url: '/images/Goldenpennyspaghetti.webp'
  },
  {
    id: 'prod-23',
    trader_id: 'trader-1',
    category_id: 'cat-9',
    name: 'Sunlight Washing Powder 1kg (Pack of 6)',
    description: 'Sunlight multi-purpose detergent powder. Clean clothes, fresh fragrance. Get 2 packs per share and save big.',
    shares_per_person: '2 Packs (1kg each)',
    total_price: 12000,
    total_shares: 3,
    price_per_share: 4000,
    stock_quantity: 30,
    estimated_delivery: '1-2 Days',
    pickup_location: 'DELSU Site II Gate Shop 1B',
    status: 'active',
    image_url: '/images/sunlight.jpg'
  },
  {
    id: 'prod-24',
    trader_id: 'trader-1',
    category_id: 'cat-4',
    name: 'Coca-Cola Pet Bottles Carton (12 Pack)',
    description: 'Chilled, refreshing Coca-Cola pet bottles (50cl). Perfect for refreshments, parties, or study sessions. Split with another student.',
    shares_per_person: '6 Bottles',
    total_price: 4800,
    total_shares: 2,
    price_per_share: 2400,
    stock_quantity: 30,
    estimated_delivery: 'Same Day Pickup',
    pickup_location: 'DELSU Site II Gate Shop 1B',
    status: 'active',
    image_url: '/images/coke.png'
  }
];

// Seed initial group orders (some near completion)
const MOCK_GROUP_ORDERS: GroupOrder[] = [
  {
    id: 'group-1',
    product_id: 'prod-1',
    shares_purchased: 3, // 3 out of 4 joined (Almost Complete!)
    shares_needed: 4,
    status: 'pending',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString() // 3 hours ago
  },
  {
    id: 'group-2',
    product_id: 'prod-2',
    shares_purchased: 2, // 2 out of 4 (Nearly Full / Halfway there)
    shares_needed: 4,
    status: 'pending',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 'group-3',
    product_id: 'prod-3',
    shares_purchased: 1, // 1 out of 2 (Almost Complete / 1 share left)
    shares_needed: 2,
    status: 'pending',
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'group-4',
    product_id: 'prod-8',
    shares_purchased: 2, // 2 out of 4 joined
    shares_needed: 4,
    status: 'pending',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'group-5',
    product_id: 'prod-11',
    shares_purchased: 1, // 1 out of 3 joined
    shares_needed: 3,
    status: 'pending',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'group-6',
    product_id: 'prod-17',
    shares_purchased: 2, // 2 out of 3 joined
    shares_needed: 3,
    status: 'pending',
    created_at: new Date(Date.now() - 3600000 * 8).toISOString()
  }
];

const MOCK_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    product_id: 'prod-1',
    buyer_id: 'buyer-random-1',
    buyer_name: 'Chinedu Okafor',
    rating: 5,
    comment: 'The garri is very dry and swells nicely. Saving ₦15k by splitting it with others is a lifesaver!',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString()
  },
  {
    id: 'rev-2',
    product_id: 'prod-2',
    buyer_id: 'buyer-random-2',
    buyer_name: 'Blessing Efe',
    rating: 4,
    comment: 'Indomie arrived in perfect condition. Pickup at Site II gate was smooth and trader was friendly.',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

// Initialize local storage database helper
const getLocal = <T>(key: string, fallback: T): T => {
  const item = localStorage.getItem(`kobowise_${key}`);
  return item ? JSON.parse(item) : fallback;
};

const setLocal = <T>(key: string, data: T): void => {
  localStorage.setItem(`kobowise_${key}`, JSON.stringify(data));
};

// Initialize Mock Database in localStorage if empty
export const initializeMockDb = (force = false): void => {
  // Force re-seed if old multi-trader data exists
  const storedProfiles = localStorage.getItem('kobowise_profiles');
  if (storedProfiles) {
    try {
      const parsedProfiles = JSON.parse(storedProfiles) as Profile[];
      const hasOldTraders = parsedProfiles.some(p => p.id === 'trader-2' || p.id === 'trader-3' || p.id === 'trader-4');
      const hasKoboWise = parsedProfiles.some(p => p.full_name === 'KoboWise Store');
      if (hasOldTraders || !hasKoboWise) {
        localStorage.removeItem('kobowise_profiles');
        localStorage.removeItem('kobowise_products');
        localStorage.removeItem('kobowise_group_orders');
        localStorage.removeItem('kobowise_orders');
        localStorage.removeItem('kobowise_order_items');
      }
    } catch {}
  }

  const storedProds = localStorage.getItem('kobowise_products');
  if (storedProds) {
    try {
      const parsed = JSON.parse(storedProds) as Product[];
      if (
        parsed.some(p => (p.total_shares !== 1 && p.total_shares !== 2 && p.total_shares !== 4) || !p.shares_per_person) || 
        parsed.length < 24 || 
        parsed.some(p => p.name === 'DELSU Student ID') ||
        parsed.some(p => p.name.toLowerCase().includes('nivea')) ||
        parsed.some(p => p.name.toLowerCase().includes('oranges'))
      ) {
        localStorage.removeItem('kobowise_products');
        localStorage.removeItem('kobowise_group_orders');
        localStorage.removeItem('kobowise_orders');
        localStorage.removeItem('kobowise_order_items');
      }
    } catch {}
  }

  if (force || !localStorage.getItem('kobowise_profiles')) setLocal('profiles', MOCK_PROFILES);
  if (force || !localStorage.getItem('kobowise_categories')) setLocal('categories', MOCK_CATEGORIES);
  if (force || !localStorage.getItem('kobowise_products')) setLocal('products', MOCK_PRODUCTS);
  if (force || !localStorage.getItem('kobowise_group_orders')) setLocal('group_orders', MOCK_GROUP_ORDERS);
  if (force || !localStorage.getItem('kobowise_reviews')) setLocal('reviews', MOCK_REVIEWS);
  if (force || !localStorage.getItem('kobowise_order_items')) setLocal('order_items', []);
  if (force || !localStorage.getItem('kobowise_orders')) setLocal('orders', []);
  if (force || !localStorage.getItem('kobowise_notifications')) setLocal('notifications', [
    {
      id: 'notif-1',
      user_id: 'buyer-1',
      title: 'Welcome to KoboWise!',
      message: 'Join group purchases with other DELSU students and save bulk money together. Browse products below!',
      is_read: false,
      created_at: new Date().toISOString()
    }
  ]);
  if (force || !localStorage.getItem('kobowise_wishlist')) setLocal('wishlist', []);
};

// Always ensure mock fallback data is initialized
initializeMockDb();

// ============================================================================
// MOCK EVENT SYSTEM (FOR REAL-TIME UPDATES)
// ============================================================================

type EventCallback = (data: any) => void;
class MockEventEmitter {
  private listeners: { [event: string]: EventCallback[] } = {};

  subscribe(event: string, callback: EventCallback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    
    // Return unsubscribe function
    return {
      unsubscribe: () => {
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
      }
    };
  }

  emit(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }
}

export const mockRealtime = new MockEventEmitter();

// Names of simulated DELSU students for automatic filling
const SIMULATED_BUYERS = [
  'Precious Okonkwo', 'Chinedu Okafor', 'Efe Oghenekaro', 'Blessing Johnson',
  'Tega Akpobome', 'Gift Emeka', 'Tunde Alao', 'Zainab Bello',
  'Daniel Harrison', 'Joy Omoruyi', 'Favor Nwachukwu', 'Kelvin Utomi'
];

// SIMULATED_AVATARS is not used yet, commented out to satisfy strict unused checks
// const SIMULATED_AVATARS = [
//   'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
//   'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60',
//   'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=60',
//   'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60',
//   'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=60'
// ];

/**
 * Periodically simulates other students joining active groups
 * to showcase real-time progress bars and group completion
 */
if (isDemoMode) {
  setInterval(() => {
    const groupOrders = getLocal<GroupOrder[]>('group_orders', []);
    const pendingGroups = groupOrders.filter(g => g.status === 'pending');
    
    if (pendingGroups.length === 0) return;

    // Pick a random pending group order to join
    const randomGroup = pendingGroups[Math.floor(Math.random() * pendingGroups.length)];
    const products = getLocal<Product[]>('products', []);
    const product = products.find(p => p.id === randomGroup.product_id);
    
    if (!product) return;

    // 15% chance to simulate a join every 12 seconds
    if (Math.random() > 0.35) return;

    const simulatedBuyerName = SIMULATED_BUYERS[Math.floor(Math.random() * SIMULATED_BUYERS.length)];
    const sharesToBuy = 1;

    // Update group order
    const updatedGroups = groupOrders.map(g => {
      if (g.id === randomGroup.id) {
        const newPurchased = g.shares_purchased + sharesToBuy;
        const isComplete = newPurchased >= g.shares_needed;
        
        const updated = {
          ...g,
          shares_purchased: Math.min(newPurchased, g.shares_needed),
          status: isComplete ? 'completed' as const : 'pending' as const
        };

        // Trigger notifications if complete
        if (isComplete) {
          // Notify trader
          const notifications = getLocal<Notification[]>('notifications', []);
          notifications.push({
            id: `notif-${Date.now()}`,
            user_id: product.trader_id,
            title: 'Group Purchase Complete!',
            message: `Group order for bulk "${product.name}" has been completed! Ready for pickup/delivery prep.`,
            is_read: false,
            created_at: new Date().toISOString()
          });
          setLocal('notifications', notifications);
          mockRealtime.emit('notifications_updated', {});
        }

        return updated;
      }
      return g;
    });

    setLocal('group_orders', updatedGroups);
    mockRealtime.emit('groups_updated', updatedGroups);

    // Notify user of activity
    mockRealtime.emit('toast', {
      message: `${simulatedBuyerName} joined the group for "${product.name}"!`,
      type: 'info'
    });

  }, 12000);
}

// ============================================================================
// DATA SERVICE LAYER
// ============================================================================

export const dbService = {
  // --- AUTHENTICATION & PROFILES ---
  async getProfile(userId: string): Promise<Profile | null> {
    if (isDemoMode) {
      const profiles = getLocal<Profile[]>('profiles', []);
      return profiles.find(p => p.id === userId) || null;
    }
    const { data, error } = await supabase!
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) return null;
    return data;
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
    if (isDemoMode) {
      const profiles = getLocal<Profile[]>('profiles', []);
      const updated = profiles.map(p => p.id === userId ? { ...p, ...updates } : p);
      setLocal('profiles', updated);
      return updated.find(p => p.id === userId) || null;
    }
    const { data, error } = await supabase!
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    if (error) return null;
    return data;
  },

  // --- CATEGORIES ---
  async getCategories(): Promise<Category[]> {
    if (isDemoMode) {
      return getLocal<Category[]>('categories', MOCK_CATEGORIES);
    }
    try {
      const { data, error } = await supabase!
        .from('categories')
        .select('*')
        .order('name');
      if (error || !data || data.length === 0) {
        return getLocal<Category[]>('categories', MOCK_CATEGORIES);
      }
      return data;
    } catch {
      return getLocal<Category[]>('categories', MOCK_CATEGORIES);
    }
  },

  // --- PRODUCTS ---
  async getProducts(): Promise<Product[]> {
    const getFallbackProducts = () => {
      const products = getLocal<Product[]>('products', MOCK_PRODUCTS);
      const profiles = getLocal<Profile[]>('profiles', MOCK_PROFILES);
      return products.map(p => {
        const trader = profiles.find(t => t.id === p.trader_id);
        return {
          ...p,
          trader_name: trader ? trader.full_name : 'KoboWise Store'
        };
      });
    };

    if (isDemoMode) {
      return getFallbackProducts();
    }
    try {
      const { data, error } = await supabase!
        .from('products')
        .select('*, profiles(full_name)')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      if (error || !data || data.length === 0) {
        console.warn('Supabase getProducts returned empty or error, using fallback products:', error);
        return getFallbackProducts();
      }
      return data.map(p => ({
        ...p,
        trader_name: p.profiles?.full_name || 'KoboWise Store'
      }));
    } catch (err) {
      console.warn('Error fetching products from Supabase, using fallback products:', err);
      return getFallbackProducts();
    }
  },

  async getProductById(productId: string): Promise<Product | null> {
    const products = await this.getProducts();
    return products.find(p => p.id === productId) || null;
  },

  async createProduct(product: Omit<Product, 'id' | 'status'>): Promise<Product | null> {
    if (isDemoMode) {
      const products = getLocal<Product[]>('products', MOCK_PRODUCTS);
      const newProduct: Product = {
        ...product,
        id: `prod-${Date.now()}`,
        status: 'active'
      };
      products.push(newProduct);
      setLocal('products', products);
      return newProduct;
    }
    const { data, error } = await supabase!
      .from('products')
      .insert([product])
      .select()
      .single();
    if (error) return null;
    return data;
  },

  async updateProduct(productId: string, updates: Partial<Product>): Promise<Product | null> {
    if (isDemoMode) {
      const products = getLocal<Product[]>('products', MOCK_PRODUCTS);
      const updated = products.map(p => p.id === productId ? { ...p, ...updates } as Product : p);
      setLocal('products', updated);
      return updated.find(p => p.id === productId) || null;
    }
    const { data, error } = await supabase!
      .from('products')
      .update(updates)
      .eq('id', productId)
      .select()
      .single();
    if (error) return null;
    return data;
  },

  async deleteProduct(productId: string): Promise<boolean> {
    if (isDemoMode) {
      const products = getLocal<Product[]>('products', MOCK_PRODUCTS);
      const filtered = products.filter(p => p.id !== productId);
      setLocal('products', filtered);
      return true;
    }
    const { error } = await supabase!
      .from('products')
      .delete()
      .eq('id', productId);
    return !error;
  },

  // --- GROUP BUY LOGIC & JOINING ---
  async getGroupOrders(): Promise<GroupOrder[]> {
    const getFallbackGroupOrders = async () => {
      const groups = getLocal<GroupOrder[]>('group_orders', MOCK_GROUP_ORDERS);
      const products = await this.getProducts();
      return groups.map(g => ({
        ...g,
        product: products.find(p => p.id === g.product_id)
      })).filter(g => g.product !== undefined);
    };

    if (isDemoMode) {
      return getFallbackGroupOrders();
    }
    try {
      const { data, error } = await supabase!
        .from('group_orders')
        .select('*, products(*)')
        .order('created_at', { ascending: false });
      if (error || !data || data.length === 0) {
        return getFallbackGroupOrders();
      }
      return data.map(g => ({
        ...g,
        product: g.products
      }));
    } catch {
      return getFallbackGroupOrders();
    }
  },

  async joinGroupOrder(
    buyerId: string, 
    productId: string, 
    sharesToBuy: number,
    paymentMethod: string,
    paymentReference: string
  ): Promise<Order | null> {
    const products = await this.getProducts();
    const product = products.find(p => p.id === productId);
    if (!product) throw new Error('Product not found');

    const uniqueOrderNo = generateUniqueOrderNumber();
    const finalRef = (paymentReference && paymentReference.length >= 13 && !paymentReference.startsWith('PAY-')) 
      ? paymentReference 
      : uniqueOrderNo;

    if (isDemoMode) {
      const groupOrders = getLocal<GroupOrder[]>('group_orders', MOCK_GROUP_ORDERS);
      let group = groupOrders.find(g => g.product_id === productId && g.status === 'pending');
      
      if (!group) {
        group = {
          id: `group-${Date.now()}`,
          product_id: productId,
          shares_purchased: 0,
          shares_needed: product.total_shares,
          status: 'pending',
          created_at: new Date().toISOString()
        };
        groupOrders.push(group);
      }

      // Calculate new shares purchased
      const newPurchased = group.shares_purchased + sharesToBuy;
      const isComplete = newPurchased >= group.shares_needed;

      // Update group order
      group.shares_purchased = Math.min(newPurchased, group.shares_needed);
      if (isComplete) {
        group.status = 'completed';
      }

      setLocal('group_orders', groupOrders);

      // Create Order with unique order number
      const orders = getLocal<Order[]>('orders', []);
      const newOrder: Order = {
        id: uniqueOrderNo,
        buyer_id: buyerId,
        group_order_id: group.id,
        shares_bought: sharesToBuy,
        total_price: sharesToBuy * product.price_per_share,
        status: isComplete ? 'ready_for_pickup' : 'paid',
        payment_method: paymentMethod,
        payment_reference: finalRef,
        created_at: new Date().toISOString()
      };
      orders.push(newOrder);
      setLocal('orders', orders);

      // Create Order Item
      const orderItems = getLocal<OrderItem[]>('order_items', []);
      orderItems.push({
        id: `item-${Date.now()}`,
        group_order_id: group.id,
        buyer_id: buyerId,
        shares_bought: sharesToBuy,
        price_paid: sharesToBuy * product.price_per_share,
        created_at: new Date().toISOString()
      });
      setLocal('order_items', orderItems);

      // Add Payment details
      const payments = getLocal<any[]>('payments', []);
      payments.push({
        id: `pay-${Date.now()}`,
        order_id: newOrder.id,
        amount: newOrder.total_price,
        reference: finalRef,
        status: 'success',
        created_at: new Date().toISOString()
      });
      setLocal('payments', payments);

      // Send User notifications
      const notifications = getLocal<Notification[]>('notifications', []);
      notifications.push({
        id: `notif-${Date.now()}-user`,
        user_id: buyerId,
        title: 'Joined Group Buy!',
        message: `Successfully paid ₦${newOrder.total_price} for Order ${finalRef} (${product.name}).`,
        is_read: false,
        created_at: new Date().toISOString()
      });

      if (isComplete) {
        // Notify trader and other buyers
        notifications.push({
          id: `notif-${Date.now()}-trader`,
          user_id: product.trader_id,
          title: 'Group Complete - Fulfill Order!',
          message: `The group buy for "${product.name}" is completed. Please prep the items for pickup at ${product.pickup_location}.`,
          is_read: false,
          created_at: new Date().toISOString()
        });

        // Trigger updates for other buyers
        const orderBuyers = orderItems.filter(item => item.group_order_id === group!.id).map(item => item.buyer_id);
        orderBuyers.forEach(bId => {
          if (bId !== buyerId && bId !== product.trader_id) {
            notifications.push({
              id: `notif-${Date.now()}-${bId}`,
              user_id: bId,
              title: 'Group Buying Complete!',
              message: `Fantastic! The group for "${product.name}" is now fully funded. Go collect your portion at ${product.pickup_location}!`,
              is_read: false,
              created_at: new Date().toISOString()
            });
          }
        });
      }

      setLocal('notifications', notifications);

      // Emit updates to instantly update progress bars
      mockRealtime.emit('groups_updated', groupOrders);
      mockRealtime.emit('notifications_updated', {});
      
      return newOrder;
    }

    // Live Mode
    let { data: currentGroup, error: fetchError } = await supabase!
      .from('group_orders')
      .select('*')
      .eq('product_id', productId)
      .eq('status', 'pending')
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (!currentGroup) {
      const { data: newGroup, error: createError } = await supabase!
        .from('group_orders')
        .insert({
          product_id: productId,
          shares_needed: product.total_shares,
          shares_purchased: 0,
          status: 'pending'
        })
        .select()
        .single();
      if (createError) throw createError;
      currentGroup = newGroup;
    }

    const nextShares = currentGroup.shares_purchased + sharesToBuy;
    const isCompleted = nextShares >= currentGroup.shares_needed;

    // Update group order share counts
    const { error: updateGroupError } = await supabase!
      .from('group_orders')
      .update({
        shares_purchased: Math.min(nextShares, currentGroup.shares_needed),
        status: isCompleted ? 'completed' : 'pending'
      })
      .eq('id', currentGroup.id);

    if (updateGroupError) throw updateGroupError;

    // Create Order Transaction
    const { data: order, error: orderError } = await supabase!
      .from('orders')
      .insert({
        buyer_id: buyerId,
        group_order_id: currentGroup.id,
        shares_bought: sharesToBuy,
        total_price: sharesToBuy * product.price_per_share,
        status: isCompleted ? 'ready_for_pickup' : 'paid',
        payment_method: paymentMethod,
        payment_reference: finalRef
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create Order Item
    await supabase!
      .from('order_items')
      .insert({
        group_order_id: currentGroup.id,
        buyer_id: buyerId,
        shares_bought: sharesToBuy,
        price_paid: sharesToBuy * product.price_per_share
      });

    // Create Payment Log
    await supabase!
      .from('payments')
      .insert({
        order_id: order.id,
        amount: order.total_price,
        reference: finalRef,
        status: 'success'
      });

    // Create Notification logs
    await supabase!
      .from('notifications')
      .insert({
        user_id: buyerId,
        title: 'Joined Group Buy!',
        message: `Successfully paid ₦${order.total_price} for Order ${finalRef} (${product.name}).`
      });

    if (isCompleted) {
      await supabase!
        .from('notifications')
        .insert({
          user_id: product.trader_id,
          title: 'Group Complete - Fulfill Order!',
          message: `The group buy for "${product.name}" is completed. Please prep the items for pickup at ${product.pickup_location}.`
        });
    }

    const allGroups = await this.getGroupOrders();
    mockRealtime.emit('groups_updated', allGroups);
    mockRealtime.emit('notifications_updated', {});

    return { ...order, payment_reference: finalRef };
  },

  // --- ORDERS ---
  async getBuyerOrders(buyerId: string): Promise<Order[]> {
    if (isDemoMode) {
      const orders = getLocal<Order[]>('orders', []);
      const groupOrders = getLocal<GroupOrder[]>('group_orders', []);
      const products = await this.getProducts();
      
      return orders
        .filter(o => o.buyer_id === buyerId)
        .map(o => {
          const grp = groupOrders.find(g => g.id === o.group_order_id);
          const prod = grp ? products.find(p => p.id === grp.product_id) : null;
          return {
            ...o,
            product_name: prod ? prod.name : 'Unknown Product',
            trader_name: prod ? prod.trader_name : 'Unknown Trader',
            estimated_delivery: prod ? prod.estimated_delivery : '',
            pickup_location: prod ? prod.pickup_location : ''
          };
        })
        .sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    
    const { data, error } = await supabase!
      .from('orders')
      .select('*, group_orders(*, products(*, profiles(full_name)))')
      .eq('buyer_id', buyerId)
      .order('created_at', { ascending: false });

    if (error) return [];
    
    return data.map(o => {
      const prod = o.group_orders?.products;
      return {
        ...o,
        product_name: prod?.name || 'Unknown Product',
        trader_name: prod?.profiles?.full_name || 'Unknown Trader',
        estimated_delivery: prod?.estimated_delivery || '',
        pickup_location: prod?.pickup_location || ''
      };
    });
  },

  async getTraderOrders(traderId: string): Promise<Order[]> {
    if (isDemoMode) {
      const orders = getLocal<Order[]>('orders', []);
      const groupOrders = getLocal<GroupOrder[]>('group_orders', []);
      const products = await this.getProducts();
      const profiles = getLocal<Profile[]>('profiles', []);

      return orders
        .filter(o => {
          const grp = groupOrders.find(g => g.id === o.group_order_id);
          const prod = grp ? products.find(p => p.id === grp.product_id) : null;
          return prod && prod.trader_id === traderId;
        })
        .map(o => {
          const grp = groupOrders.find(g => g.id === o.group_order_id);
          const prod = grp ? products.find(p => p.id === grp.product_id) : null;
          const buyer = profiles.find(p => p.id === o.buyer_id);
          return {
            ...o,
            product_name: prod ? prod.name : 'Unknown Product',
            buyer_name: buyer ? buyer.full_name : 'Student Buyer',
            pickup_location: prod ? prod.pickup_location : ''
          };
        })
        .sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    const { data, error } = await supabase!
      .from('orders')
      .select('*, profiles(full_name), group_orders!inner(*, products!inner(*))')
      .eq('group_orders.products.trader_id', traderId)
      .order('created_at', { ascending: false });

    if (error) return [];

    return data.map(o => ({
      ...o,
      buyer_name: o.profiles?.full_name || 'Student Buyer',
      product_name: o.group_orders?.products?.name || 'Unknown Product',
      pickup_location: o.group_orders?.products?.pickup_location || ''
    }));
  },

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<boolean> {
    if (isDemoMode) {
      const orders = getLocal<Order[]>('orders', []);
      const updated = orders.map(o => {
        if (o.id === orderId) {
          // Notify buyer of status update
          const notifications = getLocal<Notification[]>('notifications', []);
          const products = getLocal<Product[]>('products', []);
          const groupOrders = getLocal<GroupOrder[]>('group_orders', []);
          const grp = groupOrders.find(g => g.id === o.group_order_id);
          const prod = grp ? products.find(p => p.id === grp.product_id) : null;

          let message = `Your order status was updated to: ${status.replace(/_/g, ' ')}.`;
          if (status === 'ready_for_pickup') {
            message = `Ready! Go pick up your portion of "${prod ? prod.name : 'your bulk buy'}" at ${prod ? prod.pickup_location : 'the pickup point'}.`;
          } else if (status === 'delivered') {
            message = `Collected! Your portion of "${prod ? prod.name : 'your bulk buy'}" has been marked as picked up. Thank you!`;
          }

          notifications.push({
            id: `notif-${Date.now()}`,
            user_id: o.buyer_id,
            title: status === 'ready_for_pickup' ? 'Ready for Pickup!' : 'Order Update',
            message,
            is_read: false,
            created_at: new Date().toISOString()
          });
          setLocal('notifications', notifications);
          mockRealtime.emit('notifications_updated', {});
          
          return { ...o, status };
        }
        return o;
      });
      setLocal('orders', updated);
      return true;
    }

    const { error } = await supabase!
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    return !error;
  },

  async cancelOrder(orderId: string, buyerId: string): Promise<boolean> {
    if (isDemoMode) {
      const orders = getLocal<Order[]>('orders', []);
      const order = orders.find(o => o.id === orderId && o.buyer_id === buyerId);
      if (!order || order.status === 'cancelled') return false;

      order.status = 'cancelled';
      setLocal('orders', orders);

      const groupOrders = getLocal<GroupOrder[]>('group_orders', []);
      const groupIndex = groupOrders.findIndex(g => g.id === order.group_order_id);
      if (groupIndex !== -1) {
        const group = groupOrders[groupIndex];
        const newPurchased = Math.max(0, group.shares_purchased - order.shares_bought);
        group.shares_purchased = newPurchased;
        if (newPurchased < group.shares_needed) {
          group.status = 'pending';
        }
        setLocal('group_orders', groupOrders);
        mockRealtime.emit('groups_updated', groupOrders);
      }

      const notifications = getLocal<Notification[]>('notifications', []);
      notifications.push({
        id: `notif-${Date.now()}`,
        user_id: buyerId,
        title: 'Order Cancelled',
        message: `Order #${order.payment_reference || order.id} has been cancelled and group progress updated.`,
        is_read: false,
        created_at: new Date().toISOString()
      });
      setLocal('notifications', notifications);
      mockRealtime.emit('notifications_updated', {});

      return true;
    }

    try {
      const { data: order } = await supabase!
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('buyer_id', buyerId)
        .single();

      if (!order || order.status === 'cancelled') return false;

      await supabase!
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId);

      const { data: group } = await supabase!
        .from('group_orders')
        .select('*')
        .eq('id', order.group_order_id)
        .single();

      if (group) {
        const newPurchased = Math.max(0, group.shares_purchased - order.shares_bought);
        const isCompleted = newPurchased >= group.shares_needed;
        await supabase!
          .from('group_orders')
          .update({
            shares_purchased: newPurchased,
            status: isCompleted ? 'completed' : 'pending'
          })
          .eq('id', group.id);
      }

      const allGroups = await this.getGroupOrders();
      mockRealtime.emit('groups_updated', allGroups);
      mockRealtime.emit('notifications_updated', {});
      return true;
    } catch (err) {
      console.error('Error cancelling order:', err);
      return false;
    }
  },

  async deleteOrder(orderId: string, buyerId: string): Promise<boolean> {
    if (isDemoMode) {
      const orders = getLocal<Order[]>('orders', []);
      const order = orders.find(o => o.id === orderId && o.buyer_id === buyerId);
      if (!order) return false;

      if (order.status !== 'cancelled') {
        const groupOrders = getLocal<GroupOrder[]>('group_orders', []);
        const groupIndex = groupOrders.findIndex(g => g.id === order.group_order_id);
        if (groupIndex !== -1) {
          const group = groupOrders[groupIndex];
          const newPurchased = Math.max(0, group.shares_purchased - order.shares_bought);
          group.shares_purchased = newPurchased;
          if (newPurchased < group.shares_needed) {
            group.status = 'pending';
          }
          setLocal('group_orders', groupOrders);
          mockRealtime.emit('groups_updated', groupOrders);
        }
      }

      const filtered = orders.filter(o => o.id !== orderId);
      setLocal('orders', filtered);
      mockRealtime.emit('notifications_updated', {});
      return true;
    }

    try {
      const { data: order } = await supabase!
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('buyer_id', buyerId)
        .single();

      if (!order) return false;

      if (order.status !== 'cancelled') {
        const { data: group } = await supabase!
          .from('group_orders')
          .select('*')
          .eq('id', order.group_order_id)
          .single();

        if (group) {
          const newPurchased = Math.max(0, group.shares_purchased - order.shares_bought);
          await supabase!
            .from('group_orders')
            .update({
              shares_purchased: newPurchased,
              status: newPurchased >= group.shares_needed ? 'completed' : 'pending'
            })
            .eq('id', group.id);
        }
      }

      await supabase!.from('orders').delete().eq('id', orderId);

      const allGroups = await this.getGroupOrders();
      mockRealtime.emit('groups_updated', allGroups);
      mockRealtime.emit('notifications_updated', {});
      return true;
    } catch (err) {
      console.error('Error deleting order:', err);
      return false;
    }
  },

  // --- REVIEWS ---
  async getReviews(productId: string): Promise<Review[]> {
    if (isDemoMode) {
      const reviews = getLocal<Review[]>('reviews', []);
      return reviews.filter(r => r.product_id === productId);
    }
    const { data, error } = await supabase!
      .from('reviews')
      .select('*, profiles(full_name)')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    if (error) return [];
    return data.map(r => ({
      ...r,
      buyer_name: r.profiles?.full_name || 'Student Buyer'
    }));
  },

  async addReview(productId: string, buyerId: string, buyerName: string, rating: number, comment: string): Promise<Review | null> {
    if (isDemoMode) {
      const reviews = getLocal<Review[]>('reviews', []);
      const newReview: Review = {
        id: `rev-${Date.now()}`,
        product_id: productId,
        buyer_id: buyerId,
        buyer_name: buyerName,
        rating,
        comment,
        created_at: new Date().toISOString()
      };
      reviews.push(newReview);
      setLocal('reviews', reviews);
      return newReview;
    }
    const { data, error } = await supabase!
      .from('reviews')
      .insert({ product_id: productId, buyer_id: buyerId, rating, comment })
      .select()
      .single();
    if (error) return null;
    return {
      ...data,
      buyer_name: buyerName
    };
  },

  // --- WISHLIST ---
  async getWishlist(buyerId: string): Promise<Product[]> {
    if (isDemoMode) {
      const wishlist = getLocal<any[]>('wishlist', []);
      const userWish = wishlist.filter(w => w.buyer_id === buyerId).map(w => w.product_id);
      const products = await this.getProducts();
      return products.filter(p => userWish.includes(p.id));
    }
    const { data, error } = await supabase!
      .from('wishlist')
      .select('*, products(*, profiles(full_name))')
      .eq('buyer_id', buyerId);
    if (error) return [];
    return data.map(w => ({
      ...w.products,
      trader_name: w.products?.profiles?.full_name || 'Local Trader'
    }));
  },

  async toggleWishlist(buyerId: string, productId: string): Promise<boolean> {
    if (isDemoMode) {
      const wishlist = getLocal<any[]>('wishlist', []);
      const index = wishlist.findIndex(w => w.buyer_id === buyerId && w.product_id === productId);
      if (index > -1) {
        wishlist.splice(index, 1);
        setLocal('wishlist', wishlist);
        return false; // Removed
      } else {
        wishlist.push({ id: `wish-${Date.now()}`, buyer_id: buyerId, product_id: productId });
        setLocal('wishlist', wishlist);
        return true; // Added
      }
    }
    
    // Check if exists
    const { data } = await supabase!
      .from('wishlist')
      .select('id')
      .eq('buyer_id', buyerId)
      .eq('product_id', productId)
      .maybeSingle();

    if (data) {
      await supabase!.from('wishlist').delete().eq('id', data.id);
      return false;
    } else {
      await supabase!.from('wishlist').insert({ buyer_id: buyerId, product_id: productId });
      return true;
    }
  },

  // --- NOTIFICATIONS ---
  async getNotifications(userId: string): Promise<Notification[]> {
    if (isDemoMode) {
      const notifs = getLocal<Notification[]>('notifications', []);
      return notifs
        .filter(n => n.user_id === userId)
        .sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    const { data, error } = await supabase!
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) return [];
    return data;
  },

  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    if (isDemoMode) {
      const notifs = getLocal<Notification[]>('notifications', []);
      const updated = notifs.map(n => n.id === notificationId ? { ...n, is_read: true } : n);
      setLocal('notifications', updated);
      mockRealtime.emit('notifications_updated', {});
      return true;
    }
    const { error } = await supabase!
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    return !error;
  },

  // --- TRADER WAITLIST ---
  async addToTraderWaitlist(
    fullName: string,
    email: string,
    phoneNumber: string,
    campus: string = 'DELSU Abraka'
  ): Promise<{ success: boolean; error?: string }> {
    if (isDemoMode) {
      const waitlist = getLocal<TraderWaitlistEntry[]>('trader_waitlist', []);
      
      // Check for duplicate email
      if (waitlist.some(w => w.email.toLowerCase() === email.toLowerCase())) {
        return { success: false, error: 'This email is already on the waitlist.' };
      }

      const newEntry: TraderWaitlistEntry = {
        id: `waitlist-${Date.now()}`,
        full_name: fullName,
        email,
        phone_number: phoneNumber,
        campus,
        status: 'pending',
        created_at: new Date().toISOString()
      };
      waitlist.push(newEntry);
      setLocal('trader_waitlist', waitlist);
      return { success: true };
    }

    // Live mode: Insert into Supabase trader_waitlist table
    try {
      const { error } = await supabase!
        .from('trader_waitlist')
        .insert({
          full_name: fullName,
          email,
          phone_number: phoneNumber,
          campus
        });

      if (error) {
        if (error.code === '23505') {
          return { success: false, error: 'This email is already on the waitlist.' };
        }

        // Graceful fallback to local storage if trader_waitlist table does not exist yet in Supabase
        if (
          error.code === '42P01' || 
          error.code === 'PGRST205' || 
          error.message?.includes('trader_waitlist') || 
          error.message?.includes('schema cache')
        ) {
          console.warn('Supabase trader_waitlist table is missing from database schema cache. Falling back to local storage.', error);
          const waitlist = getLocal<TraderWaitlistEntry[]>('trader_waitlist', []);
          if (waitlist.some(w => w.email.toLowerCase() === email.toLowerCase())) {
            return { success: false, error: 'This email is already on the waitlist.' };
          }
          const newEntry: TraderWaitlistEntry = {
            id: `waitlist-${Date.now()}`,
            full_name: fullName,
            email,
            phone_number: phoneNumber,
            campus,
            status: 'pending',
            created_at: new Date().toISOString()
          };
          waitlist.push(newEntry);
          setLocal('trader_waitlist', waitlist);
          return { success: true };
        }

        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      console.error('Error adding to trader waitlist:', err);
      const waitlist = getLocal<TraderWaitlistEntry[]>('trader_waitlist', []);
      if (!waitlist.some(w => w.email.toLowerCase() === email.toLowerCase())) {
        waitlist.push({
          id: `waitlist-${Date.now()}`,
          full_name: fullName,
          email,
          phone_number: phoneNumber,
          campus,
          status: 'pending',
          created_at: new Date().toISOString()
        });
        setLocal('trader_waitlist', waitlist);
      }
      return { success: true };
    }
  },

  async getTraderWaitlist(): Promise<TraderWaitlistEntry[]> {
    if (isDemoMode) {
      return getLocal<TraderWaitlistEntry[]>('trader_waitlist', []);
    }
    try {
      const { data, error } = await supabase!
        .from('trader_waitlist')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error fetching trader waitlist from Supabase, returning local waitlist:', error);
        return getLocal<TraderWaitlistEntry[]>('trader_waitlist', []);
      }
      return data || [];
    } catch {
      return getLocal<TraderWaitlistEntry[]>('trader_waitlist', []);
    }
  }
};
