-- Check if opportunities table exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'crm_opportunities') THEN
        -- Create opportunities table
        CREATE TABLE public.crm_opportunities (
          id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
          contact_id UUID NOT NULL REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          description TEXT,
          stage public.funnel_stage NOT NULL DEFAULT 'contato_inicial',
          estimated_value DECIMAL(15,2),
          currency TEXT DEFAULT 'BRL',
          probability INTEGER DEFAULT 50 CHECK (probability >= 0 AND probability <= 100),
          expected_close_date DATE,
          actual_close_date DATE,
          product_interest TEXT,
          lost_reason TEXT,
          assigned_to UUID REFERENCES public.profiles(id),
          created_by UUID REFERENCES public.profiles(id),
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );

        -- Enable RLS
        ALTER TABLE public.crm_opportunities ENABLE ROW LEVEL SECURITY;

        -- Create RLS policies
        CREATE POLICY "Users can create opportunities" 
        ON public.crm_opportunities 
        FOR INSERT 
        WITH CHECK (auth.uid() = created_by);

        CREATE POLICY "Optimized CRM opportunities view" 
        ON public.crm_opportunities 
        FOR SELECT 
        USING (
          auth.uid() = assigned_to OR 
          auth.uid() = created_by OR 
          is_current_user_admin_or_supervisor()
        );

        CREATE POLICY "Optimized CRM opportunities update" 
        ON public.crm_opportunities 
        FOR UPDATE 
        USING (
          auth.uid() = assigned_to OR 
          auth.uid() = created_by OR 
          is_current_user_admin_or_supervisor()
        );

        -- Create indexes for performance
        CREATE INDEX idx_crm_opportunities_contact_id ON public.crm_opportunities(contact_id);
        CREATE INDEX idx_crm_opportunities_stage ON public.crm_opportunities(stage);
        CREATE INDEX idx_crm_opportunities_assigned_to ON public.crm_opportunities(assigned_to);
        CREATE INDEX idx_crm_opportunities_created_by ON public.crm_opportunities(created_by);
        CREATE INDEX idx_crm_opportunities_expected_close_date ON public.crm_opportunities(expected_close_date);

        -- Create trigger for updated_at
        CREATE TRIGGER update_crm_opportunities_updated_at
          BEFORE UPDATE ON public.crm_opportunities
          FOR EACH ROW
          EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END$$;

-- Check if documents table exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'crm_documents') THEN
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
          uploaded_by UUID REFERENCES public.profiles(id),
          uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );

        -- Enable RLS on documents
        ALTER TABLE public.crm_documents ENABLE ROW LEVEL SECURITY;

        -- Create RLS policies for documents
        CREATE POLICY "Users can upload documents" 
        ON public.crm_documents 
        FOR INSERT 
        WITH CHECK (auth.uid() = uploaded_by);

        CREATE POLICY "Optimized CRM documents view" 
        ON public.crm_documents 
        FOR SELECT 
        USING (
          auth.uid() = uploaded_by OR 
          is_current_user_admin_or_supervisor() OR
          (contact_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM crm_contacts 
            WHERE crm_contacts.id = crm_documents.contact_id 
            AND (crm_contacts.assigned_to = auth.uid() OR crm_contacts.created_by = auth.uid())
          )) OR
          (opportunity_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM crm_opportunities 
            WHERE crm_opportunities.id = crm_documents.opportunity_id 
            AND (crm_opportunities.assigned_to = auth.uid() OR crm_opportunities.created_by = auth.uid())
          ))
        );

        -- Create indexes for documents
        CREATE INDEX idx_crm_documents_contact_id ON public.crm_documents(contact_id);
        CREATE INDEX idx_crm_documents_opportunity_id ON public.crm_documents(opportunity_id);
        CREATE INDEX idx_crm_documents_uploaded_by ON public.crm_documents(uploaded_by);
    END IF;
END$$;