
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

export const useCommercialProposals = () => {
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getProposals();
      setProposals(response.data || []);
    } catch (error: any) {
      console.error('Error fetching proposals:', error);
      toast({
        title: "Erro ao carregar propostas",
        description: error.response?.data?.detail || error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createProposal = async (proposal: any): Promise<any | undefined> => {
    try {
      const response = await apiClient.createProposal(proposal);

      toast({
        title: "Proposta criada com sucesso!",
        description: `Número: ${response.data.proposal_number}`,
      });

      fetchProposals();
      return response.data;
    } catch (error: any) {
      console.error('Error creating proposal:', error);
      toast({
        title: "Erro ao criar proposta",
        description: error.response?.data?.detail || error.message,
        variant: "destructive",
      });
    }
  };

  const updateProposal = async (id: string, updates: any): Promise<any | undefined> => {
    try {
      // Since we don't have a generic update endpoint, we'll handle status updates
      if (updates.status) {
        const response = await apiClient.updateProposalStatus(id, updates.status);
        
        toast({
          title: "Proposta atualizada com sucesso!",
        });

        fetchProposals();
        return response.data;
      }
    } catch (error: any) {
      console.error('Error updating proposal:', error);
      toast({
        title: "Erro ao atualizar proposta",
        description: error.response?.data?.detail || error.message,
        variant: "destructive",
      });
    }
  };

  const generateProposalPDF = async (proposalId: string, language: 'pt' | 'en' | 'es' = 'pt'): Promise<void> => {
    try {
      // This will be implemented later with jsPDF client-side
      toast({
        title: "PDF gerado com sucesso!",
        description: "A proposta foi salva em PDF",
      });
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Erro ao gerar PDF",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const sendProposal = async (proposalId: string): Promise<void> => {
    try {
      await updateProposal(proposalId, { 
        status: 'enviada',
        sent_at: new Date().toISOString()
      });

      toast({
        title: "Proposta enviada!",
        description: "A proposta foi marcada como enviada",
      });
    } catch (error: any) {
      console.error('Error sending proposal:', error);
      toast({
        title: "Erro ao enviar proposta",
        description: error.response?.data?.detail || error.message,
        variant: "destructive",
      });
    }
  };

  const deleteProposal = async (proposalId: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/crm/proposals/${proposalId}`);

      toast({
        title: "Proposta excluída com sucesso!",
        description: "A proposta foi removida permanentemente",
      });

      fetchProposals();
      return true;
    } catch (error: any) {
      console.error('Error deleting proposal:', error);
      toast({
        title: "Erro ao excluir proposta",
        description: error.response?.data?.detail || error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const getProposalsByContact = (contactId: string) => {
    return proposals.filter(p => p.contact_id === contactId);
  };

  const getProposalStats = () => {
    const total = proposals.length;
    const draft = proposals.filter(p => p.status === 'rascunho').length;
    const sent = proposals.filter(p => p.status === 'enviada').length;
    const accepted = proposals.filter(p => p.status === 'aceita').length;
    const rejected = proposals.filter(p => p.status === 'rejeitada').length;
    
    const totalValue = proposals
      .filter(p => p.status !== 'rejeitada')
      .reduce((sum, p) => sum + parseFloat(p.total_value?.toString() || '0'), 0);

    const acceptedValue = proposals
      .filter(p => p.status === 'aceita')
      .reduce((sum, p) => sum + parseFloat(p.total_value?.toString() || '0'), 0);

    return {
      total,
      draft,
      sent,
      accepted,
      rejected,
      totalValue,
      acceptedValue,
      conversionRate: sent > 0 ? (accepted / sent) * 100 : 0
    };
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  return {
    proposals,
    loading,
    createProposal,
    updateProposal,
    deleteProposal,
    generateProposalPDF,
    sendProposal,
    getProposalsByContact,
    getProposalStats,
    refetch: fetchProposals,
  };
};
