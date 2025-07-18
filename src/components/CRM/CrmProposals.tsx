import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useCommercialProposals } from '@/hooks/useCommercialProposals';
import { generateProposalPDF } from './Proposals/ProposalPDFGenerator';
import ProposalStats from './Proposals/ProposalStats';
import ProposalsList from './Proposals/ProposalsList';
import NewProposalModal from './Proposals/NewProposalModal';

const CrmProposals = () => {
  const [showNewProposalModal, setShowNewProposalModal] = useState(false);
  const [editingProposal, setEditingProposal] = useState(null);

  const {
    proposals,
    loading,
    createProposal,
    updateProposal,
    deleteProposal,
    generateProposalPDF: savePDF,
    sendProposal,
    getProposalStats,
  } = useCommercialProposals();

  const stats = getProposalStats();

  const handleCreateProposal = async (proposalData: any) => {
    const result = await createProposal(proposalData);
    if (result) {
      setShowNewProposalModal(false);
    }
  };

  const handleEditProposal = (proposal: any) => {
    setEditingProposal(proposal);
    setShowNewProposalModal(true);
  };

  const handleGeneratePDF = async (proposalId: string, language: 'pt' | 'en' | 'es') => {
    const proposal = proposals.find(p => p.id === proposalId);
    if (proposal) {
      generateProposalPDF(proposal, language);
      await savePDF(proposalId, language);
    }
  };

  const handleSendProposal = async (proposalId: string) => {
    await sendProposal(proposalId);
  };

  const handleStatusUpdate = async (proposalId: string, status: 'rascunho' | 'enviada' | 'aceita' | 'rejeitada' | 'expirada') => {
    await updateProposal(proposalId, { status });
  };

  const handleDeleteProposal = async (proposalId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta proposta? Esta ação não pode ser desfeita.')) {
      await deleteProposal(proposalId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Propostas Comerciais</h2>
          <p className="text-muted-foreground">
            Gerencie cotações e propostas para exportação
          </p>
        </div>
        <Button onClick={() => setShowNewProposalModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Proposta
        </Button>
      </div>

      <ProposalStats stats={stats} />

      <ProposalsList
        proposals={proposals}
        loading={loading}
        onEdit={handleEditProposal}
        onGeneratePDF={handleGeneratePDF}
        onSend={handleSendProposal}
        onStatusUpdate={handleStatusUpdate}
        onDelete={handleDeleteProposal}
      />

      <NewProposalModal
        open={showNewProposalModal}
        onOpenChange={setShowNewProposalModal}
        onSubmit={handleCreateProposal}
        loading={loading}
      />
    </div>
  );
};

export default CrmProposals;
