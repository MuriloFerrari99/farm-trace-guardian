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

  const { contacts } = useCrmContacts();
  const { opportunities } = useCrmOpportunities();

  const handleContinue = () => {
    if (selectedContactId) {
      setStep('calculator');
    }
  };

  const handleBack = () => {
    setStep('selection');
  };

  const handleSubmit = (proposalData: any) => {
    onSubmit({
      ...proposalData,
      contact_id: selectedContactId,
      opportunity_id: selectedOpportunityId || null,
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

              {selectedContactId && (
                <div>
                  <Label htmlFor="opportunity">Oportunidade (Opcional)</Label>
                  <Select value={selectedOpportunityId} onValueChange={setSelectedOpportunityId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma oportunidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhuma oportunidade</SelectItem>
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
              <Button onClick={handleContinue} disabled={!selectedContactId}>
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
                Cliente: {contacts.find(c => c.id === selectedContactId)?.company_name}
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