-- Fix the proposal number generation function to handle concurrency
-- Drop existing function first
DROP FUNCTION IF EXISTS public.generate_proposal_number();

-- Create improved function with better concurrency handling
CREATE OR REPLACE FUNCTION public.generate_proposal_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  next_number INTEGER;
  year_suffix TEXT;
  new_proposal_number TEXT;
  max_attempts INTEGER := 10;
  attempt_count INTEGER := 0;
BEGIN
  year_suffix := TO_CHAR(CURRENT_DATE, 'YY');
  
  -- Retry loop to handle concurrency
  LOOP
    attempt_count := attempt_count + 1;
    
    -- Lock the table to prevent concurrent access during number generation
    PERFORM pg_advisory_xact_lock(hashtext('generate_proposal_number'));
    
    -- Get the next sequential number
    SELECT COALESCE(MAX(CAST(SUBSTRING(proposal_number FROM '([0-9]+)$') AS INTEGER)), 0) + 1
    INTO next_number
    FROM public.commercial_proposals
    WHERE proposal_number ~ ('^PROP-' || year_suffix || '-[0-9]+$');
    
    -- Generate the new proposal number
    new_proposal_number := 'PROP-' || year_suffix || '-' || LPAD(next_number::TEXT, 4, '0');
    
    -- Check if this number already exists (safety check)
    IF NOT EXISTS (
      SELECT 1 FROM public.commercial_proposals 
      WHERE proposal_number = new_proposal_number
    ) THEN
      -- Number is unique, we can use it
      RETURN new_proposal_number;
    END IF;
    
    -- If we've tried too many times, throw an error
    IF attempt_count >= max_attempts THEN
      RAISE EXCEPTION 'Failed to generate unique proposal number after % attempts', max_attempts;
    END IF;
    
    -- Wait a bit before retrying (helps with high concurrency)
    PERFORM pg_sleep(0.01);
  END LOOP;
END;
$$;