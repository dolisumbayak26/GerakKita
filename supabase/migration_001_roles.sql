-- Migration: Add Roles and Driver Assignment
-- Description: Adds 'role' to users and 'driver_id' to buses.

-- 1. Add role to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS role text DEFAULT 'customer' 
CHECK (role IN ('customer', 'driver', 'admin'));

-- 2. Add driver_id to buses table
ALTER TABLE public.buses 
ADD COLUMN IF NOT EXISTS driver_id uuid 
REFERENCES public.users(id);

-- 3. Policy: Allow anyone (authenticated) to view bus locations (already implicit if public, but good to note)
-- Ensure 'anon' or 'authenticated' can select from buses.
GRANT SELECT ON public.buses TO anon, authenticated;

-- 4. Policy: Only drivers/admins should update bus locations (This is enforced by RLS typically, but here is the logic intent)
-- For MVP, we might keep RLS open or simple.
