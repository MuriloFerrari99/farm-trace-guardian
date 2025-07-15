-- Create CRM database structure

-- Enum for contact status
CREATE TYPE contact_status AS ENUM ('ativo', 'desqualificado', 'em_negociacao');

-- Enum for business segments
CREATE TYPE business_segment AS ENUM ('importador', 'distribuidor', 'varejo', 'atacado', 'industria', 'outros');

-- Enum for interaction types
CREATE TYPE interaction_type AS ENUM ('ligacao', 'reuniao', 'email', 'whatsapp', 'visita', 'outros');

-- Enum for interaction results
CREATE TYPE interaction_result AS ENUM ('sucesso', 'follow_up', 'sem_interesse', 'proposta_enviada', 'agendamento', 'outros');

-- Enum for sales funnel stages
CREATE TYPE funnel_stage AS ENUM ('contato_inicial', 'qualificado', 'proposta_enviada', 'negociacao', 'fechado_ganhou', 'fechado_perdeu');

-- Table for CRM contacts/companies
CREATE TABLE public.crm_contacts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    whatsapp TEXT,
    country TEXT,
    state TEXT,
    city TEXT,
    segment business_segment NOT NULL DEFAULT 'outros',
    status contact_status NOT NULL DEFAULT 'ativo',
    general_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id),
    assigned_to UUID REFERENCES public.profiles(id),
    
    UNIQUE(email)
);

-- Table for interaction history
CREATE TABLE public.crm_interactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    contact_id UUID NOT NULL REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
    interaction_type interaction_type NOT NULL,
    interaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    feedback TEXT NOT NULL,
    result interaction_result,
    next_action_date DATE,
    next_action_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id)
);

-- Table for sales opportunities
CREATE TABLE public.crm_opportunities (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    contact_id UUID NOT NULL REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    estimated_value DECIMAL(15,2),
    currency TEXT DEFAULT 'BRL',
    product_interest TEXT,
    stage funnel_stage NOT NULL DEFAULT 'contato_inicial',
    probability INTEGER DEFAULT 50 CHECK (probability >= 0 AND probability <= 100),
    expected_close_date DATE,
    actual_close_date DATE,
    lost_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id),
    assigned_to UUID REFERENCES public.profiles(id)
);

-- Table for CRM documents/attachments
CREATE TABLE public.crm_documents (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    contact_id UUID REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES public.crm_opportunities(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    description TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    uploaded_by UUID REFERENCES public.profiles(id),
    
    CHECK (contact_id IS NOT NULL OR opportunity_id IS NOT NULL)
);

-- Enable Row Level Security
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for crm_contacts
CREATE POLICY "Users can view contacts assigned to them or created by them"
ON public.crm_contacts FOR SELECT
USING (
    auth.uid() = assigned_to OR 
    auth.uid() = created_by OR
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'supervisor')
    )
);

CREATE POLICY "Users can create contacts"
ON public.crm_contacts FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their assigned contacts"
ON public.crm_contacts FOR UPDATE
USING (
    auth.uid() = assigned_to OR 
    auth.uid() = created_by OR
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'supervisor')
    )
);

-- RLS Policies for crm_interactions
CREATE POLICY "Users can view interactions for their contacts"
ON public.crm_interactions FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.crm_contacts 
        WHERE id = crm_interactions.contact_id 
        AND (assigned_to = auth.uid() OR created_by = auth.uid())
    ) OR
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'supervisor')
    )
);

CREATE POLICY "Users can create interactions"
ON public.crm_interactions FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- RLS Policies for crm_opportunities
CREATE POLICY "Users can view opportunities for their contacts"
ON public.crm_opportunities FOR SELECT
USING (
    auth.uid() = assigned_to OR 
    auth.uid() = created_by OR
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'supervisor')
    )
);

CREATE POLICY "Users can create opportunities"
ON public.crm_opportunities FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their opportunities"
ON public.crm_opportunities FOR UPDATE
USING (
    auth.uid() = assigned_to OR 
    auth.uid() = created_by OR
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'supervisor')
    )
);

-- RLS Policies for crm_documents
CREATE POLICY "Users can view documents for their contacts/opportunities"
ON public.crm_documents FOR SELECT
USING (
    auth.uid() = uploaded_by OR
    EXISTS (
        SELECT 1 FROM public.crm_contacts 
        WHERE id = crm_documents.contact_id 
        AND (assigned_to = auth.uid() OR created_by = auth.uid())
    ) OR
    EXISTS (
        SELECT 1 FROM public.crm_opportunities 
        WHERE id = crm_documents.opportunity_id 
        AND (assigned_to = auth.uid() OR created_by = auth.uid())
    ) OR
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'supervisor')
    )
);

CREATE POLICY "Users can upload documents"
ON public.crm_documents FOR INSERT
WITH CHECK (auth.uid() = uploaded_by);

-- Create indexes for better performance
CREATE INDEX idx_crm_contacts_assigned_to ON public.crm_contacts(assigned_to);
CREATE INDEX idx_crm_contacts_created_by ON public.crm_contacts(created_by);
CREATE INDEX idx_crm_contacts_status ON public.crm_contacts(status);
CREATE INDEX idx_crm_interactions_contact_id ON public.crm_interactions(contact_id);
CREATE INDEX idx_crm_interactions_date ON public.crm_interactions(interaction_date);
CREATE INDEX idx_crm_opportunities_contact_id ON public.crm_opportunities(contact_id);
CREATE INDEX idx_crm_opportunities_stage ON public.crm_opportunities(stage);
CREATE INDEX idx_crm_opportunities_assigned_to ON public.crm_opportunities(assigned_to);

-- Create triggers for updated_at
CREATE TRIGGER update_crm_contacts_updated_at
    BEFORE UPDATE ON public.crm_contacts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crm_opportunities_updated_at
    BEFORE UPDATE ON public.crm_opportunities
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();