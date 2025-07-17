import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ExpeditionDocument {
  id: string;
  expedition_code: string;
  name: string;
  type: string;
  uploadDate: string;
  size: string;
  status: 'pending' | 'uploaded' | 'verified';
}

export const useExpeditionDocuments = (expeditionCode?: string) => {
  const [documents, setDocuments] = useState<ExpeditionDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const mockDocuments: ExpeditionDocument[] = [
    {
      id: '1',
      expedition_code: 'EXP-001',
      name: 'Nota Fiscal - NFe 12345',
      type: 'invoice',
      uploadDate: '2024-01-15',
      size: '245 KB',
      status: 'uploaded'
    },
    {
      id: '2',
      expedition_code: 'EXP-001',
      name: 'Certificado GLOBALG.A.P.',
      type: 'certificate',
      uploadDate: '2024-01-15',
      size: '1.2 MB',
      status: 'verified'
    }
  ];

  useEffect(() => {
    if (expeditionCode) {
      setLoading(true);
      // Filter documents by expedition code
      const filteredDocs = mockDocuments.filter(doc => doc.expedition_code === expeditionCode);
      setDocuments(filteredDocs);
      setLoading(false);
    }
  }, [expeditionCode]);

  const addDocument = (document: Omit<ExpeditionDocument, 'id'>) => {
    const newDoc: ExpeditionDocument = {
      ...document,
      id: Date.now().toString(),
    };
    
    setDocuments(prev => [...prev, newDoc]);
    toast({
      title: "Sucesso",
      description: "Documento adicionado com sucesso",
    });
  };

  const removeDocument = (documentId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    toast({
      title: "Sucesso", 
      description: "Documento removido com sucesso",
    });
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
    addDocument,
    removeDocument,
    getRequiredDocuments,
  };
};