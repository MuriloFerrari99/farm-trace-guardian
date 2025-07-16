-- Fix security issues identified by linter

-- 1. Update functions to have proper search_path set
DROP FUNCTION IF EXISTS public.handle_new_user();
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data ->> 'name', new.email), 
    new.email
  );
  return new;
end;
$function$;

-- 2. Update the other function to have proper search_path
DROP FUNCTION IF EXISTS public.update_current_lot_position();
CREATE OR REPLACE FUNCTION public.update_current_lot_position()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
    -- Update current lot position when a new movement is created
    INSERT INTO public.current_lot_positions (reception_id, current_location_id, last_movement_id, entry_date)
    VALUES (NEW.reception_id, NEW.to_location_id, NEW.id, NEW.movement_date)
    ON CONFLICT (reception_id)
    DO UPDATE SET
        current_location_id = NEW.to_location_id,
        last_movement_id = NEW.id,
        entry_date = NEW.movement_date,
        updated_at = now();
    
    RETURN NEW;
END;
$function$;

-- 3. Create trigger for lot movements if it doesn't exist
DROP TRIGGER IF EXISTS trigger_update_lot_position ON public.lot_movements;
CREATE TRIGGER trigger_update_lot_position
    AFTER INSERT ON public.lot_movements
    FOR EACH ROW
    EXECUTE FUNCTION public.update_current_lot_position();

-- 4. Create trigger for new user profiles if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();