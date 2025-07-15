-- Add new fields to producers table
ALTER TABLE public.producers 
ADD COLUMN farm_name TEXT,
ADD COLUMN fruit_varieties TEXT,
ADD COLUMN additional_notes TEXT;

-- Make ggn and certificate_number optional by removing NOT NULL constraints
ALTER TABLE public.producers 
ALTER COLUMN ggn DROP NOT NULL,
ALTER COLUMN certificate_number DROP NOT NULL;