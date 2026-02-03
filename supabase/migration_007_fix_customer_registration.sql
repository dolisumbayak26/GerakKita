-- Migration 007: Fix Customer Registration Policy
-- Description: Allow customer registration by fixing RLS policy for anonymous users
-- Date: 2026-01-30

-- Drop existing policy that requires auth.uid()
DROP POLICY IF EXISTS "Allow customer creation" ON public.customers;

-- Create new policy that allows customer creation during registration
-- This allows both authenticated users (for their own profile) and service role
CREATE POLICY "Allow customer registration" ON public.customers
    FOR INSERT
    WITH CHECK (
        -- Either the user is creating their own profile
        auth.uid() = id
        -- Or it's being created by service role (for initial registration)
        OR auth.jwt()->>'role' = 'service_role'
    );

-- Also create a trigger function to auto-create customer profile on signup
-- This ensures profile is created automatically when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_customer_signup()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if this user is not already a driver
    IF NOT EXISTS (SELECT 1 FROM public.drivers WHERE id = NEW.id) THEN
        -- Insert into customers table if not exists
        INSERT INTO public.customers (
            id,
            email,
            full_name,
            phone_number,
            created_at,
            updated_at
        )
        VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
            NEW.raw_user_meta_data->>'phone_number',
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created_customer ON auth.users;

-- Create trigger that fires when new auth user is created
CREATE TRIGGER on_auth_user_created_customer
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_customer_signup();

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.handle_new_customer_signup() TO authenticated, anon;
