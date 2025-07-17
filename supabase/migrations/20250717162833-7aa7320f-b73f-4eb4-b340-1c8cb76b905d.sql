-- Add production volume field to producers table
ALTER TABLE public.producers 
ADD COLUMN production_volume_tons numeric;

-- Add comment for clarity
COMMENT ON COLUMN public.producers.production_volume_tons IS 'Volume de produção anual em toneladas da fazenda';