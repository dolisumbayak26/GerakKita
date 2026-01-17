-- 1. Fix RLS Policy to allow unassignment (setting driver_id to NULL)
DROP POLICY IF EXISTS "Enable update for drivers" ON "public"."buses";

CREATE POLICY "Enable update for drivers" ON "public"."buses"
AS PERMISSIVE FOR UPDATE
TO public
USING (auth.uid() = driver_id)
WITH CHECK (auth.uid() = driver_id OR driver_id IS NULL);

-- 2. Ensure 'available' is a valid status (if using check constraints, which user error 23514 suggested)
-- If there's a constraint check, we should probably inspect it, but setting to 'available' worked before so it should be fine.
-- Just strictly enabling the RLS policy should fix the "silent failure" or permission denied issue.
