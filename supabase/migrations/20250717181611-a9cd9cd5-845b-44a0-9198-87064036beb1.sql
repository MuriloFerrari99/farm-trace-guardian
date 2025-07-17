-- Fix security issue: set immutable search_path for generate_proposal_number function
CREATE OR REPLACE FUNCTION public.generate_proposal_number()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  next_number INTEGER;
  year_suffix TEXT;
BEGIN
  year_suffix := TO_CHAR(CURRENT_DATE, 'YY');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(proposal_number FROM '[0-9]+') AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.commercial_proposals
  WHERE proposal_number LIKE 'PROP-' || year_suffix || '-%';
  
  RETURN 'PROP-' || year_suffix || '-' || LPAD(next_number::TEXT, 4, '0');
END;
$function$