-- Fix RLS policies to allow operators to manage producers and chart of accounts

-- Drop existing restrictive policies for producers
DROP POLICY IF EXISTS "Admins and supervisors can manage producers" ON public.producers;
DROP POLICY IF EXISTS "Authenticated users can view producers" ON public.producers;

-- Create new policies for producers that allow all authenticated users
CREATE POLICY "Authenticated users can view producers" 
ON public.producers 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage producers" 
ON public.producers 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Fix chart_of_accounts policies
DROP POLICY IF EXISTS "Authenticated users can manage chart of accounts" ON public.chart_of_accounts;
DROP POLICY IF EXISTS "Authenticated users can view chart of accounts" ON public.chart_of_accounts;

CREATE POLICY "Authenticated users can view chart of accounts" 
ON public.chart_of_accounts 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage chart of accounts" 
ON public.chart_of_accounts 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Fix storage_areas policies to allow operators to manage storage
DROP POLICY IF EXISTS "Admins can manage storage areas" ON public.storage_areas;
DROP POLICY IF EXISTS "Authenticated users can view storage areas" ON public.storage_areas;

CREATE POLICY "Authenticated users can view storage areas" 
ON public.storage_areas 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage storage areas" 
ON public.storage_areas 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Ensure all financial tables have proper policies for authenticated users
-- (These were already correct but ensuring consistency)

-- Fix any missing policies for other critical tables
-- receptions table
DROP POLICY IF EXISTS "Authenticated users can create receptions" ON public.receptions;
DROP POLICY IF EXISTS "Authenticated users can update receptions" ON public.receptions;
DROP POLICY IF EXISTS "Authenticated users can view receptions" ON public.receptions;

CREATE POLICY "Authenticated users can view receptions" 
ON public.receptions 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage receptions" 
ON public.receptions 
FOR ALL 
USING (true)
WITH CHECK (true);