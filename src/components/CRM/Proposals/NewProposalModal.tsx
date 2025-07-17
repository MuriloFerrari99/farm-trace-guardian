import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProposalCalculator from './ProposalCalculator';
import { useCrmContacts } from '@/hooks/useCrmContacts';
import { useCrmOpportunities } from '@/hooks/useCrmOpportunities';

interface NewProposalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  loading?: boolean;
  preSelectedContactId?: string;
  preSelectedOpportunityId?: string;
}

const NewProposalModal: React.FC<NewProposalModalProps> = ({
  open,
  onOpenChange,
  onSubmit,
  loading = false,
  preSelectedContactId,
  preSelectedOpportunityId
}) => {
  const [selectedContactId, setSelectedContactId] = useState<string>(preSelectedContactId || '');
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string>(preSelectedOpportunityId || '');
  const [step, setStep] = useState<'selection' | 'calculator'>('selection');
  const [useManualClient, setUseManualClient] = useState(false);
  const [manualClientData, setManualClientData] = useState({
    company_name: '',
    contact_name: '',
    email: ''
  });

  const { contacts } = useCrmContacts();
  const { opportunities } = useCrmOpportunities();

  const handleContinue = () => {
    if (!useManualClient && selectedContactId) {
      setStep('calculator');
    } else if (useManualClient && manualClientData.company_name && manualClientData.contact_name && manualClientData.email) {
      setStep('calculator');
    }
  };

  const handleBack = () => {
    setStep('selection');
  };

  const handleSubmit = (proposalData: any) => {
    onSubmit({
      ...proposalData,
      contact_id: useManualClient ? null : selectedContactId,
      opportunity_id: selectedOpportunityId === 'none' ? null : selectedOpportunityId,
      manual_company_name: useManualClient ? manualClientData.company_name : null,
      manual_contact_name: useManualClient ? manualClientData.contact_name : null,
      manual_contact_email: useManualClient ? manualClientData.email : null,
    });
  };

  const filteredOpportunities = opportunities.filter(opp => 
    !selectedContactId || opp.contact_id === selectedContactId
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 'selection' ? 'Nova Proposta Comercial' : 'Calculadora de Proposta'}
          </DialogTitle>
        </DialogHeader>

        {step === 'selection' ? (
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <input
                  type="checkbox"
                  id="use-manual-client"
                  checked={useManualClient}
                  onChange={(e) => setUseManualClient(e.target.checked)}
                  className="rounded border-border"
                />
                <Label htmlFor="use-manual-client">Cliente não cadastrado no CRM</Label>
              </div>

              {!useManualClient ? (
                <div>
                  <Label htmlFor="contact">Cliente *</Label>
                  <Select value={selectedContactId} onValueChange={setSelectedContactId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {contacts.map((contact) => (
                        <SelectItem key={contact.id} value={contact.id}>
                          {contact.company_name} - {contact.contact_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="company-name">Nome da Empresa *</Label>
                    <input
                      type="text"
                      id="company-name"
                      value={manualClientData.company_name}
                      onChange={(e) => setManualClientData(prev => ({ ...prev, company_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Digite o nome da empresa"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact-name">Nome do Contato *</Label>
                    <input
                      type="text"
                      id="contact-name"
                      value={manualClientData.contact_name}
                      onChange={(e) => setManualClientData(prev => ({ ...prev, contact_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Digite o nome do contato"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact-email">Email do Contato *</Label>
                    <input
                      type="email"
                      id="contact-email"
                      value={manualClientData.email}
                      onChange={(e) => setManualClientData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Digite o email do contato"
                    />
                  </div>
                </div>
              )}

              {(selectedContactId || useManualClient) && (
                <div>
                  <Label htmlFor="opportunity">Oportunidade (Opcional)</Label>
                  <Select value={selectedOpportunityId} onValueChange={setSelectedOpportunityId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma oportunidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhuma oportunidade</SelectItem>
                      {filteredOpportunities.map((opportunity) => (
                        <SelectItem key={opportunity.id} value={opportunity.id}>
                          {opportunity.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleContinue} 
                disabled={!useManualClient && !selectedContactId || (useManualClient && (!manualClientData.company_name || !manualClientData.contact_name || !manualClientData.email))}
              >
                Continuar
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={handleBack}>
                ← Voltar
              </Button>
              <div className="text-sm text-muted-foreground">
                Cliente: {useManualClient 
                  ? manualClientData.company_name 
                  : contacts.find(c => c.id === selectedContactId)?.company_name}
              </div>
            </div>

            <ProposalCalculator
              onSubmit={handleSubmit}
              loading={loading}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NewProposalModal;