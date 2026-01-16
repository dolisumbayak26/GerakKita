-- Enable RLS just in case it wasn't
ALTER TABLE public.buses ENABLE ROW LEVEL SECURITY;

-- Allow drivers to view buses (already likely allowed, but ensuring)
CREATE POLICY "Enable read access for all users" ON "public"."buses"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

-- Allow drivers to update their assigned bus
CREATE POLICY "Enable update for drivers" ON "public"."buses"
AS PERMISSIVE FOR UPDATE
TO public
USING (auth.uid() = driver_id)
WITH CHECK (auth.uid() = driver_id);

-- Also allow update if driver_id is being SET (for assignment)
-- Actually, assignment might need a separate policy or logic if they pick it themselves.
-- For MVP: Allow authenticated users to update 'driver_id' if it is null (picking a bus).

CREATE POLICY "Enable bus assignment" ON "public"."buses"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (driver_id IS NULL OR driver_id = auth.uid())
WITH CHECK (driver_id = auth.uid() OR driver_id IS NULL);
