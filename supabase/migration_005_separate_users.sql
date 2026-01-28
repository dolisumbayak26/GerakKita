-- Migration 005: Separate Users into Customers and Drivers
-- Description: Split the users table into customers and drivers tables
-- Date: 2026-01-21

-- Step 1: Create customers table
CREATE TABLE IF NOT EXISTS public.customers (
    id uuid NOT NULL,
    email text UNIQUE,
    phone_number text UNIQUE,
    full_name text NOT NULL,
    profile_image_url text,
    encrypted_pin text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT customers_pkey PRIMARY KEY (id),
    CONSTRAINT customers_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Step 2: Create drivers table
CREATE TABLE IF NOT EXISTS public.drivers (
    id uuid NOT NULL,
    email text UNIQUE,
    phone_number text UNIQUE,
    full_name text NOT NULL,
    profile_image_url text,
    bus_id uuid UNIQUE, -- One driver, one bus
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT drivers_pkey PRIMARY KEY (id),
    CONSTRAINT drivers_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT drivers_bus_id_fkey FOREIGN KEY (bus_id) REFERENCES public.buses(id) ON DELETE SET NULL
);

-- Step 3: Migrate existing data
-- Migrate driver (role = 'driver') to drivers table
INSERT INTO public.drivers (id, email, phone_number, full_name, profile_image_url, created_at, updated_at)
SELECT 
    id, 
    email, 
    phone_number, 
    full_name, 
    profile_image_url, 
    created_at, 
    updated_at
FROM public.users
WHERE role = 'driver'
ON CONFLICT (id) DO NOTHING;

-- Migrate customers (role = 'customer' or NULL) to customers table
INSERT INTO public.customers (id, email, phone_number, full_name, profile_image_url, encrypted_pin, created_at, updated_at)
SELECT 
    id, 
    email, 
    phone_number, 
    full_name, 
    profile_image_url,
    encrypted_pin,
    created_at, 
    updated_at
FROM public.users
WHERE role = 'customer' OR role IS NULL
ON CONFLICT (id) DO NOTHING;

-- Step 4: Update buses table to remove driver_id column (no longer needed)
-- We now use drivers.bus_id instead of buses.driver_id
-- First, migrate any existing driver assignments
UPDATE public.drivers d
SET bus_id = b.id
FROM public.buses b
WHERE b.driver_id = d.id;

-- Drop policies that depend on driver_id column
DROP POLICY IF EXISTS "Enable bus assignment" ON public.buses;
DROP POLICY IF EXISTS "Enable update for drivers" ON public.buses;

-- Then drop the column
ALTER TABLE public.buses DROP COLUMN IF EXISTS driver_id;

-- Step 5: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone_number);
CREATE INDEX IF NOT EXISTS idx_drivers_email ON public.drivers(email);
CREATE INDEX IF NOT EXISTS idx_drivers_phone ON public.drivers(phone_number);
CREATE INDEX IF NOT EXISTS idx_drivers_bus_id ON public.drivers(bus_id);

-- Step 6: Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

-- Step 7: Create RLS Policies for customers
-- Customers can view their own profile
CREATE POLICY "Customers can view own profile" ON public.customers
    FOR SELECT
    USING (auth.uid() = id);

-- Customers can update their own profile
CREATE POLICY "Customers can update own profile" ON public.customers
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Allow new customer creation (for registration)
CREATE POLICY "Allow customer creation" ON public.customers
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Step 8: Create RLS Policies for drivers
-- Drivers can view their own profile
CREATE POLICY "Drivers can view own profile" ON public.drivers
    FOR SELECT
    USING (auth.uid() = id);

-- Drivers can update their own profile (including bus assignment)
CREATE POLICY "Drivers can update own profile" ON public.drivers
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Only admins can insert drivers (will be enforced by admin dashboard later)
-- For now, allow authenticated users to insert (will be restricted later)
CREATE POLICY "Allow driver creation" ON public.drivers
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Step 9: Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.customers TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.drivers TO authenticated;
GRANT SELECT ON public.customers TO anon;
GRANT SELECT ON public.drivers TO anon;

-- Step 10: Drop the role column from users table (or keep for backward compatibility)
-- We'll keep the users table for now as it might be referenced by auth triggers
-- Just drop the role column
ALTER TABLE public.users DROP COLUMN IF EXISTS role;

-- Note: transactions, reviews, and wallets currently reference users table
-- We need to handle this in application logic (check both customers and drivers tables)
-- OR create a view that unions both tables (recommended for backward compatibility)

-- Step 11: Create a unified view for backward compatibility
CREATE OR REPLACE VIEW public.users_view AS
SELECT 
    id,
    email,
    phone_number,
    full_name,
    profile_image_url,
    encrypted_pin,
    created_at,
    updated_at,
    'customer' as user_type
FROM public.customers
UNION ALL
SELECT 
    id,
    email,
    phone_number,
    full_name,
    profile_image_url,
    NULL as encrypted_pin, -- drivers don't have PIN
    created_at,
    updated_at,
    'driver' as user_type
FROM public.drivers;

-- Grant access to the view
GRANT SELECT ON public.users_view TO authenticated, anon;
