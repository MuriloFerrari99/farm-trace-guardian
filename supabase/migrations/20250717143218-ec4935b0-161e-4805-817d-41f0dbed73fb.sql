-- Add consolidated_lot_id to expedition_items table to link expeditions with consolidations
ALTER TABLE public.expedition_items 
ADD COLUMN consolidated_lot_id UUID REFERENCES public.consolidated_lots(id);

-- Add index for better performance
CREATE INDEX idx_expedition_items_consolidated_lot_id ON public.expedition_items(consolidated_lot_id);