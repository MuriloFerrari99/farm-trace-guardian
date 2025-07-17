-- Create enum for proposal status
CREATE TYPE public.proposal_status AS ENUM (
  'rascunho',
  'enviada',
  'aceita',
  'rejeitada',
  'expirada'
);

-- Create enum for incoterms
CREATE TYPE public.incoterm_type AS ENUM (
  'FOB',
  'CFR', 
  'CIF'
);

-- Create enum for proposal currency
CREATE TYPE public.proposal_currency AS ENUM (
  'USD',
  'EUR',
  'BRL'
);

-- Create commercial proposals table
CREATE TABLE public.commercial_proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_number TEXT NOT NULL UNIQUE,
  contact_id UUID NOT NULL REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES public.crm_opportunities(id) ON DELETE SET NULL,
  
  -- Product information
  product_name TEXT NOT NULL,
  product_description TEXT,
  certifications TEXT[] DEFAULT '{}',
  
  -- Pricing and terms
  unit_price DECIMAL(15,4) NOT NULL,
  currency public.proposal_currency NOT NULL DEFAULT 'USD',
  incoterm public.incoterm_type NOT NULL DEFAULT 'FOB',
  exchange_rate DECIMAL(10,6) DEFAULT 1.0,
  
  -- Volume and packaging
  total_weight_kg DECIMAL(15,3) NOT NULL,
  package_weight_kg DECIMAL(10,3) NOT NULL,
  packages_per_container INTEGER NOT NULL,
  containers_quantity INTEGER DEFAULT 1,
  
  -- Shipping details
  freight_cost DECIMAL(15,2) DEFAULT 0,
  insurance_cost DECIMAL(15,2) DEFAULT 0,
  port_of_loading TEXT,
  port_of_discharge TEXT,
  
  -- Commercial terms
  delivery_time_days INTEGER,
  payment_terms TEXT,
  validity_days INTEGER DEFAULT 30,
  
  -- Company information
  exporter_name TEXT NOT NULL,
  exporter_contact TEXT NOT NULL,
  exporter_email TEXT NOT NULL,
  
  -- Calculated fields
  total_packages INTEGER GENERATED ALWAYS AS (CEILING(total_weight_kg / package_weight_kg)) STORED,
  unit_price_brl DECIMAL(15,4) GENERATED ALWAYS AS (unit_price * exchange_rate) STORED,
  total_value DECIMAL(15,2) GENERATED ALWAYS AS (total_weight_kg * unit_price) STORED,
  total_value_brl DECIMAL(15,2) GENERATED ALWAYS AS (total_weight_kg * unit_price * exchange_rate) STORED,
  
  -- Status and tracking
  status public.proposal_status NOT NULL DEFAULT 'rascunho',
  language TEXT NOT NULL DEFAULT 'pt',
  pdf_file_path TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Audit fields
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Additional notes
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.commercial_proposals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can create proposals" 
ON public.commercial_proposals 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Optimized commercial proposals view" 
ON public.commercial_proposals 
FOR SELECT 
USING (
  auth.uid() = created_by OR 
  is_current_user_admin_or_supervisor() OR
  EXISTS (
    SELECT 1 FROM crm_contacts 
    WHERE crm_contacts.id = commercial_proposals.contact_id 
    AND (crm_contacts.assigned_to = auth.uid() OR crm_contacts.created_by = auth.uid())
  )
);

CREATE POLICY "Optimized commercial proposals update" 
ON public.commercial_proposals 
FOR UPDATE 
USING (
  auth.uid() = created_by OR 
  is_current_user_admin_or_supervisor() OR
  EXISTS (
    SELECT 1 FROM crm_contacts 
    WHERE crm_contacts.id = commercial_proposals.contact_id 
    AND (crm_contacts.assigned_to = auth.uid() OR crm_contacts.created_by = auth.uid())
  )
);

-- Create indexes for performance
CREATE INDEX idx_commercial_proposals_contact_id ON public.commercial_proposals(contact_id);
CREATE INDEX idx_commercial_proposals_opportunity_id ON public.commercial_proposals(opportunity_id);
CREATE INDEX idx_commercial_proposals_created_by ON public.commercial_proposals(created_by);
CREATE INDEX idx_commercial_proposals_status ON public.commercial_proposals(status);
CREATE INDEX idx_commercial_proposals_created_at ON public.commercial_proposals(created_at);

-- Create trigger for updated_at
CREATE TRIGGER update_commercial_proposals_updated_at
  BEFORE UPDATE ON public.commercial_proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate proposal number
CREATE OR REPLACE FUNCTION public.generate_proposal_number()
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  year_suffix TEXT;
BEGIN
  year_suffix := TO_CHAR(CURRENT_DATE, 'YY');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(proposal_number FROM '[0-9]+') AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.commercial_proposals
  WHERE proposal_number LIKE 'PROP-' || year_suffix || '-%';
  
  RETURN 'PROP-' || year_suffix || '-' || LPAD(next_number::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;