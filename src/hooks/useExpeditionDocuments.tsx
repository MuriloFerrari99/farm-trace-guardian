import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useFileUpload } from '@/hooks/useFileUpload';

interface ExpeditionDocument {
  id: string;
  expedition_code: string;
  name: string;
  type: string;
  upload_date: string;
  file_size: number | null;
  file_path: string;
  status: 'pending' | 'uploaded' | 'verified';
  uploaded_by: string | null;
}

export const useExpeditionDocuments = (expeditionCode?: string) => {
  const [documents, setDocuments] = useState<ExpeditionDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const { uploadFile, deleteFile, getFileUrl, isUploading } = useFileUpload({
    bucket: 'expedition-documents',
    folder: expeditionCode ? `expedition-${expeditionCode}` : 'general',
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ]
  });

  useEffect(() => {
    if (expeditionCode) {
      fetchDocuments();
    }
  }, [expeditionCode]);

  const fetchDocuments = async () => {
    if (!expeditionCode) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('expedition_documents')
        .select('*')
        .eq('expedition_code', expeditionCode)
        .order('upload_date', { ascending: false });

      if (error) throw error;
      setDocuments(data as ExpeditionDocument[] || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar documentos",
        variant: "destructive",
      });
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (file: File, documentType: string) => {
    if (!expeditionCode) {
      toast({
        title: "Erro",
        description: "Código de expedição não informado",
        variant: "destructive",
      });
      return;
    }

    try {
      // Upload file to storage
      const filePath = await uploadFile(file);
      if (!filePath) return;

      // Save document metadata to database
      const { data: user } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('expedition_documents')
        .insert({
          expedition_code: expeditionCode,
          name: file.name,
          type: documentType,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          uploaded_by: user.user?.id,
          status: 'uploaded'
        });

      if (error) throw error;

      // Refresh documents list
      await fetchDocuments();
      
      toast({
        title: "Sucesso",
        description: "Documento enviado com sucesso",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao enviar documento",
        variant: "destructive",
      });
      console.error('Error uploading document:', error);
    }
  };

  const deleteDocument = async (documentId: string) => {
    try {
      // Get document details first
      const document = documents.find(doc => doc.id === documentId);
      if (!document) return;

      // Delete from storage
      await deleteFile(document.file_path);

      // Delete from database
      const { error } = await supabase
        .from('expedition_documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;

      // Update local state
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      
      toast({
        title: "Sucesso",
        description: "Documento removido com sucesso",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao remover documento",
        variant: "destructive",
      });
      console.error('Error deleting document:', error);
    }
  };

  const downloadDocument = (document: ExpeditionDocument) => {
    const url = getFileUrl(document.file_path);
    window.open(url, '_blank');
  };

  const getDocumentSize = (sizeInBytes: number | null) => {
    if (!sizeInBytes) return 'N/A';
    
    if (sizeInBytes < 1024) return `${sizeInBytes} B`;
    if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getRequiredDocuments = () => {
    const requiredTypes = ['invoice', 'packing_list', 'certificate', 'phytosanitary'];
    return requiredTypes.map(type => ({
      type,
      hasDocument: documents.some(doc => doc.type === type),
    }));
  };

  return {
    documents,
    loading,
    isUploading,
    uploadDocument,
    deleteDocument,
    downloadDocument,
    getDocumentSize,
    getRequiredDocuments,
    fetchDocuments,
  };
};