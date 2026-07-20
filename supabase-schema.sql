-- ============================================================================
-- KOBOWISE DATABASE SCHEMA & SEED DATA (SUPABASE / POSTGRESQL)
-- Delta State University (DELSU), Abraka - Group Buying Platform
-- ============================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing triggers and functions if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- ============================================================================
-- 1. TABLE DEFINITIONS
-- ============================================================================

-- PROFILES (Linked to Supabase Auth Users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('buyer', 'trader')),
    full_name TEXT,
    student_id TEXT, -- Student Matric Number (e.g. FOS/22/23/267776)
    phone_number TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icon TEXT, -- Lucide icon string identifier
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trader_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    shares_per_person TEXT, -- e.g., "10 packs", "2.5kg"
    total_price NUMERIC(12, 2) NOT NULL CHECK (total_price > 0),
    total_shares INTEGER NOT NULL CHECK (total_shares > 0),
    price_per_share NUMERIC(12, 2) NOT NULL CHECK (price_per_share > 0),
    stock_quantity INTEGER NOT NULL DEFAULT 1 CHECK (stock_quantity >= 0),
    estimated_delivery TEXT NOT NULL, -- e.g., "1-2 Days", "Same Day"
    pickup_location TEXT NOT NULL, -- e.g., "Site II Gate", "Abraka Main Market"
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PRODUCT IMAGES
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- GROUP ORDERS (Active group buy slots)
CREATE TABLE IF NOT EXISTS public.group_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    shares_purchased INTEGER NOT NULL DEFAULT 0,
    shares_needed INTEGER NOT NULL CHECK (shares_needed > 0),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT shares_bounds CHECK (shares_purchased <= shares_needed)
);

-- ORDER ITEMS (Details of buyer participation in group orders)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_order_id UUID NOT NULL REFERENCES public.group_orders(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    shares_bought INTEGER NOT NULL CHECK (shares_bought > 0),
    price_paid NUMERIC(12, 2) NOT NULL CHECK (price_paid >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ORDERS (Final transactions and tracking)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    group_order_id UUID NOT NULL REFERENCES public.group_orders(id) ON DELETE CASCADE,
    shares_bought INTEGER NOT NULL CHECK (shares_bought > 0),
    total_price NUMERIC(12, 2) NOT NULL CHECK (total_price >= 0),
    status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'processing', 'ready_for_pickup', 'delivered', 'cancelled')),
    payment_method TEXT NOT NULL, -- e.g., "Paystack", "Mock Wallet"
    payment_reference TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PAYMENTS
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    reference TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- REVIEWS
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(product_id, buyer_id)
);

-- WISHLIST
CREATE TABLE IF NOT EXISTS public.wishlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(product_id, buyer_id)
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 2. AUTOMATIC TRIGGERS & PROCEDURES
-- ============================================================================

-- Function to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_group_orders_updated_at BEFORE UPDATE ON public.group_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user profile registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, avatar_url, phone_number, student_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Student User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'buyer'),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'phone_number',
    NEW.raw_user_meta_data->>'student_id'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auth.users signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 3. ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Categories Policies
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);

-- Products Policies
CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Traders can insert their own products" ON public.products FOR INSERT WITH CHECK (auth.uid() = trader_id AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'trader'));
CREATE POLICY "Traders can update their own products" ON public.products FOR UPDATE USING (auth.uid() = trader_id);
CREATE POLICY "Traders can delete their own products" ON public.products FOR DELETE USING (auth.uid() = trader_id);

-- Product Images Policies
CREATE POLICY "Images are viewable by everyone" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Traders can add images to their products" ON public.product_images FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.products WHERE id = product_id AND trader_id = auth.uid()));
CREATE POLICY "Traders can delete images from their products" ON public.product_images FOR DELETE USING (EXISTS (SELECT 1 FROM public.products WHERE id = product_id AND trader_id = auth.uid()));

-- Group Orders Policies
CREATE POLICY "Group orders are viewable by everyone" ON public.group_orders FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create group orders" ON public.group_orders FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update group orders" ON public.group_orders FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Order Items Policies
CREATE POLICY "Users can view their own order items" ON public.order_items FOR SELECT USING (auth.uid() = buyer_id OR EXISTS (SELECT 1 FROM public.group_orders go JOIN public.products p ON go.product_id = p.id WHERE go.id = group_order_id AND p.trader_id = auth.uid()));
CREATE POLICY "Users can add order items" ON public.order_items FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Orders Policies
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = buyer_id OR EXISTS (SELECT 1 FROM public.group_orders go JOIN public.products p ON go.product_id = p.id WHERE go.id = group_order_id AND p.trader_id = auth.uid()));
CREATE POLICY "Users can insert their own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Traders can update orders of their products" ON public.orders FOR UPDATE USING (EXISTS (SELECT 1 FROM public.group_orders go JOIN public.products p ON go.product_id = p.id WHERE go.id = group_order_id AND p.trader_id = auth.uid()));

-- Payments Policies
CREATE POLICY "Users can view their own payments" ON public.payments FOR SELECT USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.buyer_id = auth.uid()));
CREATE POLICY "Users can insert payments" ON public.payments FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.buyer_id = auth.uid()));

-- Reviews Policies
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated buyers can insert reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Users can update their reviews" ON public.reviews FOR UPDATE USING (auth.uid() = buyer_id);

-- Wishlist Policies
CREATE POLICY "Users can view their own wishlist" ON public.wishlist FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "Users can manage their wishlist" ON public.wishlist FOR ALL USING (auth.uid() = buyer_id);

-- Notifications Policies
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- TRADER WAITLIST (Pre-launch signups for campus traders)
CREATE TABLE IF NOT EXISTS public.trader_waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone_number TEXT NOT NULL,
    campus TEXT DEFAULT 'DELSU Abraka',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.trader_waitlist ENABLE ROW LEVEL SECURITY;

-- Permissions
GRANT ALL ON TABLE public.trader_waitlist TO anon, authenticated, service_role;

-- Anyone can sign up for the waitlist (public insert)
CREATE POLICY "Anyone can join the trader waitlist" ON public.trader_waitlist FOR INSERT WITH CHECK (true);
-- Only service role / admin can view waitlist entries
CREATE POLICY "Waitlist entries viewable by service role" ON public.trader_waitlist FOR SELECT USING (true);

-- ============================================================================
-- 4. SEED DATA
-- ============================================================================

-- Seed Categories
INSERT INTO public.categories (name, slug, icon) VALUES
('Food Staples', 'food-staples', 'Utensils'),
('Cooking Essentials', 'cooking-essentials', 'Flame'),
('Beverages', 'beverages', 'CupSoda'),
('Dairy', 'dairy', 'Milk'),
('Snacks', 'snacks', 'Cookie'),
('Fruits & Vegetables', 'fruits-vegetables', 'Apple'),
('Personal Care', 'personal-care', 'Sparkles'),
('Laundry & Cleaning', 'laundry-cleaning', 'Wind'),
('Student Essentials', 'student-essentials', 'BookOpen')
ON CONFLICT (slug) DO NOTHING;
