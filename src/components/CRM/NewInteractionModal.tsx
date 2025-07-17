import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface NewInteractionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
  contactId?: string;
  contactName?: string;
}

const NewInteractionModal = ({ 
  open, 
  onOpenChange, 
  onSubmit, 
  isSubmitting,
  contactId,
  contactName 
}: NewInteractionModalProps) => {
  const [formData, setFormData] = useState({
    contact_id: contactId || '',
    interaction_type: 'ligacao',
    interaction_date: new Date(),
    feedback: '',
    result: '',
    next_action_date: undefined as Date | undefined,
    next_action_description: ''
  });

  // Fetch contacts for selection when no specific contact is provided
  const { data: contacts } = useQuery({
    queryKey: ['crm-contacts-for-interaction'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_contacts')
        .select('id, company_name, contact_name')
        .eq('status', 'ativo')
        .order('company_name');
      
      if (error) throw error;
      return data;
    },
    enabled: !contactId // Only fetch when no specific contact is provided
  });

  const handleSubmit = () => {
    if (!formData.contact_id || !formData.feedback.trim()) {
      return;
    }

    onSubmit({
      ...formData,
      interaction_date: formData.interaction_date.toISOString(),
      next_action_date: formData.next_action_date?.toISOString() || null
    });

    // Reset form
    setFormData({
      contact_id: contactId || '',
      interaction_type: 'ligacao',
      interaction_date: new Date(),
      feedback: '',
      result: '',
      next_action_date: undefined,
      next_action_description: ''
    });
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Nova Interação {contactName && `- ${contactName}`}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Contact Selection - only show when no specific contact */}
          {!contactId && (
            <div className="space-y-2">
              <Label>Contato *</Label>
              <Select 
                value={formData.contact_id} 
                onValueChange={(value) => handleFieldChange('contact_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um contato" />
                </SelectTrigger>
                <SelectContent>
                  {contacts?.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.company_name} - {contact.contact_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Interação *</Label>
              <Select 
                value={formData.interaction_type} 
                onValueChange={(value) => handleFieldChange('interaction_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ligacao">Ligação</SelectItem>
                  <SelectItem value="reuniao">Reunião</SelectItem>
                  <SelectItem value="email">E-mail</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="visita">Visita</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data da Interação *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.interaction_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.interaction_date ? (
                      format(formData.interaction_date, "dd/MM/yyyy", { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.interaction_date}
                    onSelect={(date) => handleFieldChange('interaction_date', date || new Date())}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Detalhes da Interação *</Label>
            <Textarea 
              value={formData.feedback}
              onChange={(e) => handleFieldChange('feedback', e.target.value)}
              placeholder="Descreva o que foi discutido, acordado ou decidido..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Resultado da Interação</Label>
            <Select 
              value={formData.result} 
              onValueChange={(value) => handleFieldChange('result', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o resultado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sucesso">Sucesso</SelectItem>
                <SelectItem value="follow_up">Follow-up Necessário</SelectItem>
                <SelectItem value="sem_interesse">Sem Interesse</SelectItem>
                <SelectItem value="proposta_enviada">Proposta Enviada</SelectItem>
                <SelectItem value="agendamento">Agendamento Realizado</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Próxima Ação - Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.next_action_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.next_action_date ? (
                      format(formData.next_action_date, "dd/MM/yyyy", { locale: ptBR })
                    ) : (
                      <span>Data da próxima ação</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.next_action_date}
                    onSelect={(date) => handleFieldChange('next_action_date', date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Descrição da Próxima Ação</Label>
              <Input 
                value={formData.next_action_description}
                onChange={(e) => handleFieldChange('next_action_description', e.target.value)}
                placeholder="Ex: Enviar proposta comercial"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={() => onOpenChange(false)} variant="outline" className="flex-1">
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit} 
              className="flex-1" 
              disabled={isSubmitting || !formData.feedback.trim()}
            >
              {isSubmitting ? "Registrando..." : "Registrar Interação"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewInteractionModal;