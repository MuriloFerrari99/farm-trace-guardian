-- Performance optimization for RLS policies
-- This migration addresses multiple permissive policies and Auth RLS initialization plan issues

-- 1. Create optimized function to check user roles (SECURITY DEFINER to avoid recursive queries)
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
  SELECT role::text FROM public.profiles WHERE id = user_id;
$$;

-- 2. Create optimized function to check if user is admin or supervisor
CREATE OR REPLACE FUNCTION public.is_admin_or_supervisor(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id 
    AND role IN ('admin', 'supervisor')
  );
$$;

-- 3. Remove redundant policies and optimize existing ones

-- ACC Contracts: Remove redundant SELECT policy (ALL policy already covers it)
DROP POLICY IF EXISTS "Authenticated users can view ACC contracts" ON public.acc_contracts;

-- Accounts Payable: Remove redundant SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view accounts payable" ON public.accounts_payable;

-- Accounts Receivable: Remove redundant SELECT policy  
DROP POLICY IF EXISTS "Authenticated users can view accounts receivable" ON public.accounts_receivable;

-- Cash Flow: Remove redundant SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view cash flow" ON public.cash_flow;

-- Chart of Accounts: Remove redundant SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view chart of accounts" ON public.chart_of_accounts;

-- Consolidated Lots: Remove redundant SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view consolidated lots" ON public.consolidated_lots;

-- Consolidated Lot Items: Remove redundant SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view consolidated lot items" ON public.consolidated_lot_items;

-- Consolidation Documents: Remove redundant SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view consolidation documents" ON public.consolidation_documents;

-- Current Lot Positions: Remove redundant SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view current lot positions" ON public.current_lot_positions;

-- Export Insurance: Remove redundant SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view export insurance" ON public.export_insurance;

-- Financial Documents: Remove redundant SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view financial documents" ON public.financial_documents;

-- Financial Transactions: Remove redundant SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view financial transactions" ON public.financial_transactions;

-- Generated Labels: Remove redundant SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view labels" ON public.generated_labels;

-- Letter of Credit: Remove redundant SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view letter of credit" ON public.letter_of_credit;

-- Producers: Remove redundant SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view producers" ON public.producers;

-- Receptions: Remove redundant SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view receptions" ON public.receptions;

-- Storage Areas: Remove redundant SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view storage areas" ON public.storage_areas;

-- Storage Locations: Remove redundant SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view storage locations" ON public.storage_locations;

-- 4. Optimize CRM policies to reduce complex EXISTS subqueries

-- Drop existing CRM policies
DROP POLICY IF EXISTS "Users can view contacts assigned to them or created by them" ON public.crm_contacts;
DROP POLICY IF EXISTS "Users can update their assigned contacts" ON public.crm_contacts;
DROP POLICY IF EXISTS "Users can view interactions for their contacts" ON public.crm_interactions;
DROP POLICY IF EXISTS "Users can view opportunities for their contacts" ON public.crm_opportunities;
DROP POLICY IF EXISTS "Users can update their opportunities" ON public.crm_opportunities;
DROP POLICY IF EXISTS "Users can view documents for their contacts/opportunities" ON public.crm_documents;

-- Create optimized CRM policies using the new functions
CREATE POLICY "Optimized CRM contacts view" 
ON public.crm_contacts 
FOR SELECT 
TO authenticated
USING (
  auth.uid() = assigned_to OR 
  auth.uid() = created_by OR 
  public.is_admin_or_supervisor(auth.uid())
);

CREATE POLICY "Optimized CRM contacts update" 
ON public.crm_contacts 
FOR UPDATE 
TO authenticated
USING (
  auth.uid() = assigned_to OR 
  auth.uid() = created_by OR 
  public.is_admin_or_supervisor(auth.uid())
);

CREATE POLICY "Optimized CRM opportunities view" 
ON public.crm_opportunities 
FOR SELECT 
TO authenticated
USING (
  auth.uid() = assigned_to OR 
  auth.uid() = created_by OR 
  public.is_admin_or_supervisor(auth.uid())
);

CREATE POLICY "Optimized CRM opportunities update" 
ON public.crm_opportunities 
FOR UPDATE 
TO authenticated
USING (
  auth.uid() = assigned_to OR 
  auth.uid() = created_by OR 
  public.is_admin_or_supervisor(auth.uid())
);

-- For interactions, create a more efficient policy
CREATE POLICY "Optimized CRM interactions view" 
ON public.crm_interactions 
FOR SELECT 
TO authenticated
USING (
  public.is_admin_or_supervisor(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.crm_contacts 
    WHERE id = crm_interactions.contact_id 
    AND (assigned_to = auth.uid() OR created_by = auth.uid())
  )
);

-- For documents, create a more efficient policy  
CREATE POLICY "Optimized CRM documents view" 
ON public.crm_documents 
FOR SELECT 
TO authenticated
USING (
  auth.uid() = uploaded_by OR
  public.is_admin_or_supervisor(auth.uid()) OR
  (contact_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.crm_contacts 
    WHERE id = crm_documents.contact_id 
    AND (assigned_to = auth.uid() OR created_by = auth.uid())
  )) OR
  (opportunity_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.crm_opportunities 
    WHERE id = crm_documents.opportunity_id 
    AND (assigned_to = auth.uid() OR created_by = auth.uid())
  ))
);

-- 5. Create supporting indexes for RLS performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_assigned_to ON public.crm_contacts(assigned_to);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_created_by ON public.crm_contacts(created_by);
CREATE INDEX IF NOT EXISTS idx_crm_opportunities_assigned_to ON public.crm_opportunities(assigned_to);
CREATE INDEX IF NOT EXISTS idx_crm_opportunities_created_by ON public.crm_opportunities(created_by);
CREATE INDEX IF NOT EXISTS idx_crm_interactions_contact_id ON public.crm_interactions(contact_id);
CREATE INDEX IF NOT EXISTS idx_crm_documents_contact_id ON public.crm_documents(contact_id);
CREATE INDEX IF NOT EXISTS idx_crm_documents_opportunity_id ON public.crm_documents(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_crm_documents_uploaded_by ON public.crm_documents(uploaded_by);