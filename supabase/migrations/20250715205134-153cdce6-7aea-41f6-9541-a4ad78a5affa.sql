-- Create storage areas table (já existe, vou adicionar campos que faltam)
ALTER TABLE public.storage_areas 
ADD COLUMN IF NOT EXISTS zone_type TEXT CHECK (zone_type IN ('certified', 'non_certified', 'quarantine')),
ADD COLUMN IF NOT EXISTS qr_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS temperature_range_min NUMERIC,
ADD COLUMN IF NOT EXISTS temperature_range_max NUMERIC;

-- Create storage locations table (localizações específicas dentro das áreas)
CREATE TABLE IF NOT EXISTS public.storage_locations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    area_id UUID NOT NULL REFERENCES public.storage_areas(id) ON DELETE CASCADE,
    location_code TEXT NOT NULL UNIQUE,
    qr_code TEXT UNIQUE,
    position_x INTEGER,
    position_y INTEGER,
    is_occupied BOOLEAN DEFAULT FALSE,
    capacity_units INTEGER DEFAULT 1,
    current_units INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create lot movements table (movimentações dos lotes)
CREATE TABLE IF NOT EXISTS public.lot_movements (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    reception_id UUID NOT NULL REFERENCES public.receptions(id),
    from_location_id UUID REFERENCES public.storage_locations(id),
    to_location_id UUID REFERENCES public.storage_locations(id),
    movement_type TEXT NOT NULL CHECK (movement_type IN ('entry', 'internal_move', 'exit')),
    moved_by UUID REFERENCES public.profiles(id),
    movement_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create storage checklists table (checklists de boas práticas)
CREATE TABLE IF NOT EXISTS public.storage_checklists (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    reception_id UUID NOT NULL REFERENCES public.receptions(id),
    location_id UUID NOT NULL REFERENCES public.storage_locations(id),
    checked_by UUID REFERENCES public.profiles(id),
    temperature_ambient NUMERIC,
    pallet_integrity BOOLEAN,
    visual_separation_confirmed BOOLEAN,
    third_party_document TEXT,
    photos JSONB, -- Array de URLs das fotos
    additional_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create current lot positions table (posição atual dos lotes)
CREATE TABLE IF NOT EXISTS public.current_lot_positions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    reception_id UUID NOT NULL REFERENCES public.receptions(id) UNIQUE,
    current_location_id UUID NOT NULL REFERENCES public.storage_locations(id),
    entry_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_movement_id UUID REFERENCES public.lot_movements(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.storage_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lot_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.current_lot_positions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated users can view storage locations" ON public.storage_locations FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage storage locations" ON public.storage_locations FOR ALL USING (true);

CREATE POLICY "Authenticated users can view lot movements" ON public.lot_movements FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create lot movements" ON public.lot_movements FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can view storage checklists" ON public.storage_checklists FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create storage checklists" ON public.storage_checklists FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can view current lot positions" ON public.current_lot_positions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage current lot positions" ON public.current_lot_positions FOR ALL USING (true);

-- Create function to update current position when movement happens
CREATE OR REPLACE FUNCTION update_current_lot_position()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.current_lot_positions (reception_id, current_location_id, last_movement_id)
    VALUES (NEW.reception_id, NEW.to_location_id, NEW.id)
    ON CONFLICT (reception_id) 
    DO UPDATE SET 
        current_location_id = NEW.to_location_id,
        last_movement_id = NEW.id,
        updated_at = now();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic position updates
CREATE TRIGGER update_lot_position_trigger
    AFTER INSERT ON public.lot_movements
    FOR EACH ROW
    WHEN (NEW.to_location_id IS NOT NULL)
    EXECUTE FUNCTION update_current_lot_position();