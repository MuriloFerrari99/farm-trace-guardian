-- Allow proposals without mandatory contact and add new fields
ALTER TABLE public.commercial_proposals 
ALTER COLUMN contact_id DROP NOT NULL;

-- Add fields for manual client data when not linked to CRM
ALTER TABLE public.commercial_proposals 
ADD COLUMN manual_company_name text,
ADD COLUMN manual_contact_name text,
ADD COLUMN manual_contact_email text,
ADD COLUMN shipping_format text DEFAULT 'Caixas plásticas de 10kg: 120 caixas por pallet, 20 pallets por Container',
ADD COLUMN co2_range_min numeric DEFAULT 3,
ADD COLUMN co2_range_max numeric DEFAULT 10,
ADD COLUMN o2_range_min numeric DEFAULT 2,
ADD COLUMN o2_range_max numeric DEFAULT 5,
ADD COLUMN container_sealed boolean DEFAULT true,
ADD COLUMN temperature_min numeric DEFAULT 5,
ADD COLUMN temperature_max numeric DEFAULT 7;

-- Update default values for existing columns
ALTER TABLE public.commercial_proposals 
ALTER COLUMN payment_terms SET DEFAULT '50% advance / 50% arrived',
ALTER COLUMN delivery_time_days SET DEFAULT 21,
ALTER COLUMN validity_days SET DEFAULT 5,
ALTER COLUMN exchange_rate SET DEFAULT 5.50;