import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface NewTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
  contactId?: string;
  opportunityId?: string;
}

const NewTaskModal = ({ 
  open, 
  onOpenChange, 
  onSubmit, 
  isSubmitting,
  contactId,
  opportunityId 
}: NewTaskModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    task_type: 'outros',
    due_date: new Date(),
    due_time: '09:00',
    reminder_date: undefined as Date | undefined,
    reminder_time: '08:00',
    contact_id: contactId || '',
    opportunity_id: opportunityId || '',
    assigned_to: ''
  });

  // Fetch contacts and opportunities for selection
  const { data: contacts } = useQuery({
    queryKey: ['crm-contacts-for-tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_contacts')
        .select('id, company_name, contact_name')
        .eq('status', 'ativo')
        .order('company_name');
      
      if (error) throw error;
      return data;
    }
  });

  const { data: opportunities } = useQuery({
    queryKey: ['crm-opportunities-for-tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_opportunities')
        .select('id, title, contact:crm_contacts(company_name)')
        .in('stage', ['contato_inicial', 'qualificado', 'proposta_enviada', 'negociacao'])
        .order('title');
      
      if (error) throw error;
      return data;
    }
  });

  const { data: users } = useQuery({
    queryKey: ['profiles-for-assignment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.assigned_to) {
      return;
    }

    // Combine date and time for due_date
    const [hours, minutes] = formData.due_time.split(':');
    const dueDateTime = new Date(formData.due_date);
    dueDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    // Combine date and time for reminder_date if set
    let reminderDateTime = null;
    if (formData.reminder_date) {
      const [reminderHours, reminderMinutes] = formData.reminder_time.split(':');
      reminderDateTime = new Date(formData.reminder_date);
      reminderDateTime.setHours(parseInt(reminderHours), parseInt(reminderMinutes), 0, 0);
    }

    const taskData = {
      title: formData.title,
      description: formData.description || null,
      task_type: formData.task_type,
      due_date: dueDateTime.toISOString(),
      reminder_date: reminderDateTime?.toISOString() || null,
      contact_id: formData.contact_id || null,
      opportunity_id: formData.opportunity_id || null,
      assigned_to: formData.assigned_to
    };

    onSubmit(taskData);

    // Reset form
    setFormData({
      title: '',
      description: '',
      task_type: 'outros',
      due_date: new Date(),
      due_time: '09:00',
      reminder_date: undefined,
      reminder_time: '08:00',
      contact_id: contactId || '',
      opportunity_id: opportunityId || '',
      assigned_to: ''
    });
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Tarefa</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Título da Tarefa *</Label>
            <Input 
              value={formData.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              placeholder="Ex: Ligar para cliente sobre proposta"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Tarefa</Label>
              <Select 
                value={formData.task_type} 
                onValueChange={(value) => handleFieldChange('task_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ligacao">Ligação</SelectItem>
                  <SelectItem value="reuniao">Reunião</SelectItem>
                  <SelectItem value="email">E-mail</SelectItem>
                  <SelectItem value="follow_up">Follow-up</SelectItem>
                  <SelectItem value="proposta">Proposta</SelectItem>
                  <SelectItem value="visita">Visita</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Responsável *</Label>
              <Select 
                value={formData.assigned_to} 
                onValueChange={(value) => handleFieldChange('assigned_to', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o responsável" />
                </SelectTrigger>
                <SelectContent>
                  {users?.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data de Vencimento *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.due_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.due_date ? (
                      format(formData.due_date, "dd/MM/yyyy", { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.due_date}
                    onSelect={(date) => handleFieldChange('due_date', date || new Date())}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Horário</Label>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <Input 
                  type="time"
                  value={formData.due_time}
                  onChange={(e) => handleFieldChange('due_time', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Contato Relacionado</Label>
              <Select 
                value={formData.contact_id} 
                onValueChange={(value) => handleFieldChange('contact_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar contato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum contato</SelectItem>
                  {contacts?.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.company_name} - {contact.contact_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Oportunidade Relacionada</Label>
              <Select 
                value={formData.opportunity_id} 
                onValueChange={(value) => handleFieldChange('opportunity_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar oportunidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhuma oportunidade</SelectItem>
                  {opportunities?.map((opportunity) => (
                    <SelectItem key={opportunity.id} value={opportunity.id}>
                      {opportunity.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data do Lembrete</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.reminder_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.reminder_date ? (
                      format(formData.reminder_date, "dd/MM/yyyy", { locale: ptBR })
                    ) : (
                      <span>Data do lembrete</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.reminder_date}
                    onSelect={(date) => handleFieldChange('reminder_date', date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Horário do Lembrete</Label>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <Input 
                  type="time"
                  value={formData.reminder_time}
                  onChange={(e) => handleFieldChange('reminder_time', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea 
              value={formData.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              placeholder="Detalhes da tarefa..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={() => onOpenChange(false)} variant="outline" className="flex-1">
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit} 
              className="flex-1" 
              disabled={isSubmitting || !formData.title.trim() || !formData.assigned_to}
            >
              {isSubmitting ? "Criando..." : "Criar Tarefa"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewTaskModal;