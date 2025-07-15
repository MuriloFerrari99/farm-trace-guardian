
-- Create enum types for better data integrity
CREATE TYPE user_role AS ENUM ('admin', 'operator', 'supervisor');
CREATE TYPE reception_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE product_type AS ENUM ('tomate', 'alface', 'pepino', 'pimentao', 'outros');
CREATE TYPE movement_type AS ENUM ('entrada', 'saida', 'transferencia', 'consolidacao');

-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'operator',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create producers table
CREATE TABLE public.producers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  ggn TEXT NOT NULL UNIQUE,
  certificate_number TEXT NOT NULL,
  certificate_expiry DATE NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create receptions table
CREATE TABLE public.receptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reception_code TEXT NOT NULL UNIQUE,
  producer_id UUID REFERENCES producers(id) NOT NULL,
  product_type product_type NOT NULL,
  quantity_kg DECIMAL(10,2) NOT NULL,
  lot_number TEXT,
  harvest_date DATE,
  reception_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status reception_status DEFAULT 'pending',
  notes TEXT,
  received_by UUID REFERENCES profiles(id),
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create documents table for file storage
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reception_id UUID REFERENCES receptions(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, -- 'nota_fiscal', 'packing_list', 'certificado'
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_by UUID REFERENCES profiles(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create labels table for identification
CREATE TABLE public.labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reception_id UUID REFERENCES receptions(id) NOT NULL,
  label_code TEXT NOT NULL UNIQUE,
  qr_code TEXT,
  printed_at TIMESTAMP WITH TIME ZONE,
  printed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage_areas table
CREATE TABLE public.storage_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  area_code TEXT NOT NULL UNIQUE,
  is_certified BOOLEAN DEFAULT true,
  capacity_kg DECIMAL(10,2),
  current_stock_kg DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create stock_movements table for inventory tracking
CREATE TABLE public.stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reception_id UUID REFERENCES receptions(id),
  storage_area_id UUID REFERENCES storage_areas(id),
  movement_type movement_type NOT NULL,
  quantity_kg DECIMAL(10,2) NOT NULL,
  origin_area_id UUID REFERENCES storage_areas(id),
  destination_area_id UUID REFERENCES storage_areas(id),
  movement_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  executed_by UUID REFERENCES profiles(id),
  notes TEXT
);

-- Create expeditions table
CREATE TABLE public.expeditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expedition_code TEXT NOT NULL UNIQUE,
  destination TEXT NOT NULL,
  transporter TEXT,
  vehicle_plate TEXT,
  expedition_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_weight_kg DECIMAL(10,2) NOT NULL,
  expedition_documents TEXT[],
  executed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create expedition_items table for expedition details
CREATE TABLE public.expedition_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expedition_id UUID REFERENCES expeditions(id) ON DELETE CASCADE,
  reception_id UUID REFERENCES receptions(id),
  quantity_kg DECIMAL(10,2) NOT NULL,
  lot_reference TEXT
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.producers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expeditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expedition_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Authenticated users can view producers" ON public.producers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and supervisors can manage producers" ON public.producers FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'supervisor'))
);

CREATE POLICY "Authenticated users can view receptions" ON public.receptions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create receptions" ON public.receptions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update receptions" ON public.receptions FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view documents" ON public.documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can upload documents" ON public.documents FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can view labels" ON public.labels FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create labels" ON public.labels FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can view storage areas" ON public.storage_areas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage storage areas" ON public.storage_areas FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Authenticated users can view stock movements" ON public.stock_movements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create stock movements" ON public.stock_movements FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can view expeditions" ON public.expeditions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create expeditions" ON public.expeditions FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can view expedition items" ON public.expedition_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create expedition items" ON public.expedition_items FOR INSERT TO authenticated WITH CHECK (true);

-- Create trigger function to handle user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', new.email),
    new.email,
    'operator'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert some sample data
INSERT INTO public.storage_areas (name, area_code, is_certified, capacity_kg) VALUES
('Área Certificada A', 'CERT-A', true, 5000.00),
('Área Certificada B', 'CERT-B', true, 3000.00),
('Área Não Certificada', 'NAO-CERT', false, 2000.00);

INSERT INTO public.producers (name, ggn, certificate_number, certificate_expiry) VALUES
('João Silva', '4056874123456', 'CERT-001-2024', '2025-12-31'),
('Maria Santos', '4056874789012', 'CERT-002-2024', '2025-11-30'),
('Pedro Costa', '4056874345678', 'CERT-003-2024', '2025-10-31');
