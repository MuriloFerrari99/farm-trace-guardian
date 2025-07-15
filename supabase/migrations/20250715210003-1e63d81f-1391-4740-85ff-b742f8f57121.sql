-- Create consolidated lots table
CREATE TABLE IF NOT EXISTS public.consolidated_lots (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    consolidation_code TEXT NOT NULL UNIQUE,
    product_type TEXT NOT NULL,
    total_quantity_kg NUMERIC NOT NULL,
    consolidated_by UUID REFERENCES public.profiles(id),
    consolidation_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    client_name TEXT,
    client_lot_number TEXT,
    internal_lot_number TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'shipped', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create consolidated lot items table (lotes originais que foram consolidados)
CREATE TABLE IF NOT EXISTS public.consolidated_lot_items (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    consolidated_lot_id UUID NOT NULL REFERENCES public.consolidated_lots(id) ON DELETE CASCADE,
    original_reception_id UUID NOT NULL REFERENCES public.receptions(id),
    quantity_used_kg NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create labels table (etiquetas geradas)
CREATE TABLE IF NOT EXISTS public.generated_labels (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    consolidated_lot_id UUID NOT NULL REFERENCES public.consolidated_lots(id),
    label_layout TEXT NOT NULL, -- JSON com layout da etiqueta
    client_customization JSONB, -- Personalizações do cliente
    qr_code_data TEXT NOT NULL,
    pdf_file_path TEXT,
    language TEXT DEFAULT 'pt-BR',
    generated_by UUID REFERENCES public.profiles(id),
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'reprinted', 'cancelled'))
);

-- Create consolidation documents table (certificados anexados)
CREATE TABLE IF NOT EXISTS public.consolidation_documents (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    consolidated_lot_id UUID NOT NULL REFERENCES public.consolidated_lots(id),
    document_type TEXT NOT NULL CHECK (document_type IN ('certificate', 'label_pdf', 'traceability_report')),
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    producer_id UUID REFERENCES public.producers(id), -- para certificados específicos
    uploaded_by UUID REFERENCES public.profiles(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.consolidated_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consolidated_lot_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consolidation_documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated users can view consolidated lots" ON public.consolidated_lots FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage consolidated lots" ON public.consolidated_lots FOR ALL USING (true);

CREATE POLICY "Authenticated users can view consolidated lot items" ON public.consolidated_lot_items FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage consolidated lot items" ON public.consolidated_lot_items FOR ALL USING (true);

CREATE POLICY "Authenticated users can view labels" ON public.generated_labels FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage labels" ON public.generated_labels FOR ALL USING (true);

CREATE POLICY "Authenticated users can view consolidation documents" ON public.consolidation_documents FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage consolidation documents" ON public.consolidation_documents FOR ALL USING (true);