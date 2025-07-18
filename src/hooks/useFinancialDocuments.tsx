import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useErrorHandler } from "./useErrorHandler";

interface FinancialDocument {
  id: string;
  reference_id: string;
  reference_type: string;
  document_type: string;
  file_name: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  document_number?: string;
  uploaded_at: string;
  uploaded_by?: string;
}

export function useFinancialDocuments(referenceId?: string, referenceType?: string) {
  const { handleError } = useErrorHandler();

  return useQuery({
    queryKey: ['financial-documents', referenceId, referenceType],
    queryFn: async (): Promise<FinancialDocument[]> => {
      let query = supabase.from('financial_documents').select('*');
      
      if (referenceId) {
        query = query.eq('reference_id', referenceId);
      }
      
      if (referenceType) {
        query = query.eq('reference_type', referenceType);
      }

      const { data, error } = await query.order('uploaded_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    },
    enabled: !!referenceId && !!referenceType,
  });
}

export function useUploadFinancialDocument() {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: async (documentData: Omit<FinancialDocument, 'id' | 'uploaded_at'>) => {
      const { data, error } = await supabase
        .from('financial_documents')
        .insert(documentData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['financial-documents'] });
      queryClient.invalidateQueries({ 
        queryKey: ['financial-documents', data.reference_id, data.reference_type] 
      });
    },
  });
}

export function useDeleteFinancialDocument() {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: async (documentId: string) => {
      const { error } = await supabase
        .from('financial_documents')
        .delete()
        .eq('id', documentId);

      if (error) {
        throw error;
      }

      return documentId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-documents'] });
    },
    onError: handleError,
  });
}