-- Migration 008: Disable Email Confirmation for Development
-- Description: Auto-confirm user emails to skip OTP verification (for development only)
-- Date: 2026-01-30
-- WARNING: In production, you should re-enable email confirmation or setup custom SMTP

-- Update the trigger to auto-confirm emails
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
        
        -- Auto-confirm the email for development
        -- This updates the email_confirmed_at field
        UPDATE auth.users
        SET email_confirmed_at = NOW(),
            confirmation_sent_at = NOW()
        WHERE id = NEW.id
        AND email_confirmed_at IS NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- The trigger already exists from migration 007, so we just need to ensure it uses the updated function
-- No need to recreate the trigger

COMMENT ON FUNCTION public.handle_new_customer_signup() IS 'Auto-creates customer profile and confirms email for new signups (development mode)';
