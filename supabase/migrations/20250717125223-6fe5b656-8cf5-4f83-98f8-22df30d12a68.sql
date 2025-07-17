-- First add the new product types
ALTER TYPE product_type ADD VALUE IF NOT EXISTS 'abacate_hass';
ALTER TYPE product_type ADD VALUE IF NOT EXISTS 'abacate_geada';
ALTER TYPE product_type ADD VALUE IF NOT EXISTS 'abacate_brede';
ALTER TYPE product_type ADD VALUE IF NOT EXISTS 'abacate_margarida';
ALTER TYPE product_type ADD VALUE IF NOT EXISTS 'manga_tommy';
ALTER TYPE product_type ADD VALUE IF NOT EXISTS 'manga_maca';
ALTER TYPE product_type ADD VALUE IF NOT EXISTS 'manga_palmer';
ALTER TYPE product_type ADD VALUE IF NOT EXISTS 'mel';
ALTER TYPE product_type ADD VALUE IF NOT EXISTS 'limao_tahiti';

-- Add storage areas with correct zone_type values (just text, not enum)
INSERT INTO storage_areas (name, area_code, zone_type, capacity_kg, temperature_range_min, temperature_range_max, is_certified)
VALUES 
  ('Área de Recebimento', 'AR001', 'receiving', 5000, 18, 25, true),
  ('Câmara Fria A', 'CFA001', 'cold_storage', 10000, 2, 8, true),
  ('Câmara Fria B', 'CFB001', 'cold_storage', 10000, 2, 8, true),
  ('Área de Expedição', 'AE001', 'shipping', 3000, 15, 25, true);

-- Create default storage locations for each area
INSERT INTO storage_locations (area_id, location_code, capacity_units, position_x, position_y)
SELECT 
  sa.id,
  sa.area_code || '-' || LPAD((ROW_NUMBER() OVER (PARTITION BY sa.id))::text, 3, '0') as location_code,
  CASE 
    WHEN sa.zone_type = 'receiving' THEN 10
    WHEN sa.zone_type = 'cold_storage' THEN 20  
    WHEN sa.zone_type = 'shipping' THEN 8
    ELSE 5
  END as capacity_units,
  ((ROW_NUMBER() OVER (PARTITION BY sa.id) - 1) % 5) + 1 as position_x,
  ((ROW_NUMBER() OVER (PARTITION BY sa.id) - 1) / 5) + 1 as position_y
FROM storage_areas sa
CROSS JOIN generate_series(1, 
  CASE 
    WHEN sa.zone_type = 'receiving' THEN 15
    WHEN sa.zone_type = 'cold_storage' THEN 25
    WHEN sa.zone_type = 'shipping' THEN 10
    ELSE 10
  END
) as series(n)
WHERE sa.area_code IN ('AR001', 'CFA001', 'CFB001', 'AE001');