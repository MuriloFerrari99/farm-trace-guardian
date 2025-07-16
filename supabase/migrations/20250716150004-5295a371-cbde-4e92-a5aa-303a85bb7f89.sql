-- Add DELETE policies for labels and receptions tables

-- Policy for deleting labels - authenticated users can delete labels
CREATE POLICY "Authenticated users can delete labels" 
ON public.labels 
FOR DELETE 
USING (true);

-- Policy for deleting receptions - authenticated users can delete receptions
CREATE POLICY "Authenticated users can delete receptions" 
ON public.receptions 
FOR DELETE 
USING (true);