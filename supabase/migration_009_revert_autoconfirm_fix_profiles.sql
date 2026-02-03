-- Migration 009: Revert Auto-Confirm and Fix Customer Profile Creation
-- Description: Remove auto-confirm, properly create customer profiles via trigger
-- Date: 2026-01-30

-- Update trigger to NOT auto-confirm email, but properly create customer profile
CREATE OR REPLACE FUNCTION public.handle_new_customer_signup()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create customer profile, do NOT auto-confirm email
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
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            full_name = COALESCE(EXCLUDED.full_name, customers.full_name),
            phone_number = COALESCE(EXCLUDED.phone_number, customers.phone_number),
            updated_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.handle_new_customer_signup() IS 'Auto-creates customer profile for new signups (requires email verification)';

-- Fix existing users without customer profiles
-- Create customer profiles for auth users that don't have one
INSERT INTO public.customers (id, email, full_name, phone_number, created_at, updated_at)
SELECT 
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'full_name', 'User') as full_name,
    u.raw_user_meta_data->>'phone_number' as phone_number,
    u.created_at,
    NOW()
FROM auth.users u
LEFT JOIN public.customers c ON u.id = c.id
LEFT JOIN public.drivers d ON u.id = d.id
WHERE c.id IS NULL AND d.id IS NULL
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, customers.full_name),
    updated_at = NOW();
