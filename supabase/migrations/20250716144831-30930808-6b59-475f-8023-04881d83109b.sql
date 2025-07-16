-- Fix Auth RLS Initialization Plan issues - Part 1
-- First drop all dependent policies, then recreate with optimized functions

-- 1. Drop all dependent policies first
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can create contacts" ON public.crm_contacts;
DROP POLICY IF EXISTS "Optimized CRM contacts view" ON public.crm_contacts;
DROP POLICY IF EXISTS "Optimized CRM contacts update" ON public.crm_contacts;
DROP POLICY IF EXISTS "Users can create opportunities" ON public.crm_opportunities;
DROP POLICY IF EXISTS "Optimized CRM opportunities view" ON public.crm_opportunities;
DROP POLICY IF EXISTS "Optimized CRM opportunities update" ON public.crm_opportunities;
DROP POLICY IF EXISTS "Users can create interactions" ON public.crm_interactions;
DROP POLICY IF EXISTS "Optimized CRM interactions view" ON public.crm_interactions;
DROP POLICY IF EXISTS "Users can upload documents" ON public.crm_documents;
DROP POLICY IF EXISTS "Optimized CRM documents view" ON public.crm_documents;

-- 2. Now drop the old functions
DROP FUNCTION IF EXISTS public.get_user_role(uuid);
DROP FUNCTION IF EXISTS public.is_admin_or_supervisor(uuid);

-- 3. Create new optimized functions without parameters
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
  SELECT role::text FROM public.profiles WHERE id = (select auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.is_current_user_admin_or_supervisor()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (select auth.uid()) 
    AND role IN ('admin', 'supervisor')
  );
$$;

-- 4. Recreate all policies with optimized auth function calls
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING ((select auth.uid()) = id);

CREATE POLICY "Users can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Users can create contacts" 
ON public.crm_contacts 
FOR INSERT 
TO authenticated
WITH CHECK ((select auth.uid()) = created_by);

CREATE POLICY "Optimized CRM contacts view" 
ON public.crm_contacts 
FOR SELECT 
TO authenticated
USING (
  (select auth.uid()) = assigned_to OR 
  (select auth.uid()) = created_by OR 
  public.is_current_user_admin_or_supervisor()
);

CREATE POLICY "Optimized CRM contacts update" 
ON public.crm_contacts 
FOR UPDATE 
TO authenticated
USING (
  (select auth.uid()) = assigned_to OR 
  (select auth.uid()) = created_by OR 
  public.is_current_user_admin_or_supervisor()
);

CREATE POLICY "Users can create opportunities" 
ON public.crm_opportunities 
FOR INSERT 
TO authenticated
WITH CHECK ((select auth.uid()) = created_by);

CREATE POLICY "Optimized CRM opportunities view" 
ON public.crm_opportunities 
FOR SELECT 
TO authenticated
USING (
  (select auth.uid()) = assigned_to OR 
  (select auth.uid()) = created_by OR 
  public.is_current_user_admin_or_supervisor()
);

CREATE POLICY "Optimized CRM opportunities update" 
ON public.crm_opportunities 
FOR UPDATE 
TO authenticated
USING (
  (select auth.uid()) = assigned_to OR 
  (select auth.uid()) = created_by OR 
  public.is_current_user_admin_or_supervisor()
);

CREATE POLICY "Users can create interactions" 
ON public.crm_interactions 
FOR INSERT 
TO authenticated
WITH CHECK ((select auth.uid()) = created_by);

CREATE POLICY "Optimized CRM interactions view" 
ON public.crm_interactions 
FOR SELECT 
TO authenticated
USING (
  public.is_current_user_admin_or_supervisor() OR
  EXISTS (
    SELECT 1 FROM public.crm_contacts 
    WHERE id = crm_interactions.contact_id 
    AND (assigned_to = (select auth.uid()) OR created_by = (select auth.uid()))
  )
);

CREATE POLICY "Users can upload documents" 
ON public.crm_documents 
FOR INSERT 
TO authenticated
WITH CHECK ((select auth.uid()) = uploaded_by);

CREATE POLICY "Optimized CRM documents view" 
ON public.crm_documents 
FOR SELECT 
TO authenticated
USING (
  (select auth.uid()) = uploaded_by OR
  public.is_current_user_admin_or_supervisor() OR
  (contact_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.crm_contacts 
    WHERE id = crm_documents.contact_id 
    AND (assigned_to = (select auth.uid()) OR created_by = (select auth.uid()))
  )) OR
  (opportunity_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.crm_opportunities 
    WHERE id = crm_documents.opportunity_id 
    AND (assigned_to = (select auth.uid()) OR created_by = (select auth.uid()))
  ))
);