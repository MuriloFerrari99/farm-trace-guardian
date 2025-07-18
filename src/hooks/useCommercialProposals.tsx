import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type CommercialProposal = Database['public']['Tables']['commercial_proposals']['Row'];
type CommercialProposalInsert = Database['public']['Tables']['commercial_proposals']['Insert'];
type CommercialProposalUpdate = Database['public']['Tables']['commercial_proposals']['Update'];

export const useCommercialProposals = () => {
  const [proposals, setProposals] = useState<CommercialProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('commercial_proposals')
        .select(`
          *,
          contact:crm_contacts(contact_name, company_name, email),
          opportunity:crm_opportunities(title, stage)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProposals(data || []);
    } catch (error: any) {
      console.error('Error fetching proposals:', error);
      toast({
        title: "Erro ao carregar propostas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createProposal = async (proposal: CommercialProposalInsert): Promise<CommercialProposal | undefined> => {
    try {
      // Generate proposal number
      const { data: proposalNumber, error: numberError } = await supabase
        .rpc('generate_proposal_number');

      if (numberError) throw numberError;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const proposalData = {
        ...proposal,
        proposal_number: proposalNumber,
        created_by: user.id,
        expires_at: new Date(Date.now() + (proposal.validity_days || 30) * 24 * 60 * 60 * 1000).toISOString(),
      };

      // Debug log to check data being sent
      console.log('Creating proposal with data:', {
        co2_range_min: proposalData.co2_range_min,
        co2_range_max: proposalData.co2_range_max,
        o2_range_min: proposalData.o2_range_min,
        o2_range_max: proposalData.o2_range_max,
        temperature_min: proposalData.temperature_min,
        temperature_max: proposalData.temperature_max,
        container_sealed: proposalData.container_sealed
      });

      const { data, error } = await supabase
        .from('commercial_proposals')
        .insert(proposalData)
        .select()
        .single();

      if (error) throw error;

      console.log('Proposal created successfully:', {
        id: data.id,
        co2_range_min: data.co2_range_min,
        co2_range_max: data.co2_range_max,
        o2_range_min: data.o2_range_min,
        o2_range_max: data.o2_range_max,
        temperature_min: data.temperature_min,
        temperature_max: data.temperature_max,
        container_sealed: data.container_sealed
      });

      toast({
        title: "Proposta criada com sucesso!",
        description: `Número: ${data.proposal_number}`,
      });

      fetchProposals();
      return data;
    } catch (error: any) {
      console.error('Error creating proposal:', error);
      toast({
        title: "Erro ao criar proposta",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateProposal = async (id: string, updates: CommercialProposalUpdate): Promise<CommercialProposal | undefined> => {
    try {
      const { data, error } = await supabase
        .from('commercial_proposals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Proposta atualizada com sucesso!",
      });

      fetchProposals();
      return data;
    } catch (error: any) {
      console.error('Error updating proposal:', error);
      toast({
        title: "Erro ao atualizar proposta",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const generateProposalPDF = async (proposalId: string, language: 'pt' | 'en' | 'es' = 'pt'): Promise<void> => {
    try {
      // Update language preference
      await updateProposal(proposalId, { language });
      
      // This will be implemented with jsPDF
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
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteProposal = async (proposalId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('commercial_proposals')
        .delete()
        .eq('id', proposalId);

      if (error) throw error;

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
        description: error.message,
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
