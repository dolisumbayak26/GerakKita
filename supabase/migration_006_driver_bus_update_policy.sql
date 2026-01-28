-- Migration: Add RLS policy for drivers to update their assigned bus
-- This allows drivers to update bus location and clear it when stopping tracking

-- Drop existing update policies if any (cleanup)
DROP POLICY IF EXISTS "Drivers can update their assigned bus" ON public.buses;

-- Create policy: Drivers can only update the bus assigned to them
CREATE POLICY "Drivers can update their assigned bus"
ON public.buses
FOR UPDATE
TO authenticated
USING (
    -- Driver can only update the bus that is assigned to them in drivers table
    id IN (
        SELECT bus_id 
        FROM public.drivers 
        WHERE auth.uid() = id
    )
)
WITH CHECK (
    -- Same condition for the updated row
    id IN (
        SELECT bus_id 
        FROM public.drivers 
        WHERE auth.uid() = id
    )
);

-- Grant UPDATE permission to authenticated users
GRANT UPDATE ON public.buses TO authenticated;
