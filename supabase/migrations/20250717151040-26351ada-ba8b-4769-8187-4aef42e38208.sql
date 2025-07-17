-- Create storage bucket for expedition documents
INSERT INTO storage.buckets (id, name, public) VALUES ('expedition-documents', 'expedition-documents', false);

-- Create storage policies for expedition documents
CREATE POLICY "Authenticated users can view expedition documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'expedition-documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can upload expedition documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'expedition-documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update expedition documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'expedition-documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete expedition documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'expedition-documents' AND auth.uid() IS NOT NULL);

-- Create expedition_documents table
CREATE TABLE public.expedition_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  expedition_code TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  uploaded_by UUID REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'uploaded' CHECK (status IN ('pending', 'uploaded', 'verified'))
);

-- Enable RLS
ALTER TABLE public.expedition_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for expedition_documents
CREATE POLICY "Authenticated users can manage expedition documents" 
ON public.expedition_documents 
FOR ALL 
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_expedition_documents_updated_at
BEFORE UPDATE ON public.expedition_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();