import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ContactEditModalProps {
  contact: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ContactEditModal = ({ contact, open, onOpenChange }: ContactEditModalProps) => {
  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    whatsapp: '',
    country: '',
    state: '',
    city: '',
    segment: 'outros',
    status: 'ativo',
    general_notes: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (contact) {
      setFormData({
        company_name: contact.company_name || '',
        contact_name: contact.contact_name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        whatsapp: contact.whatsapp || '',
        country: contact.country || '',
        state: contact.state || '',
        city: contact.city || '',
        segment: contact.segment || 'outros',
        status: contact.status || 'ativo',
        general_notes: contact.general_notes || ''
      });
    }
  }, [contact]);

  const updateContactMutation = useMutation({
    mutationFn: async (contactData: any) => {
      const { data, error } = await supabase
        .from('crm_contacts')
        .update(contactData)
        .eq('id', contact.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-contacts'] });
      toast({
        title: "Sucesso",
        description: "Contato atualizado com sucesso",
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar contato: " + error.message,
        variant: "destructive",
      });
    }
  });

  const handleSubmit = () => {
    if (!formData.company_name || !formData.contact_name || !formData.email) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    updateContactMutation.mutate(formData);
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Contato</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome da Empresa *</Label>
              <Input 
                value={formData.company_name}
                onChange={(e) => handleFieldChange('company_name', e.target.value)}
                placeholder="Ex: ABC Trading Company" 
              />
            </div>
            <div className="space-y-2">
              <Label>Nome do Contato *</Label>
              <Input 
                value={formData.contact_name}
                onChange={(e) => handleFieldChange('contact_name', e.target.value)}
                placeholder="Ex: João Silva" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>E-mail *</Label>
              <Input 
                type="email"
                value={formData.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                placeholder="joao@empresa.com" 
              />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input 
                value={formData.phone}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                placeholder="+55 11 9999-9999" 
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>País</Label>
              <Input 
                value={formData.country}
                onChange={(e) => handleFieldChange('country', e.target.value)}
                placeholder="Brasil" 
              />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Input 
                value={formData.state}
                onChange={(e) => handleFieldChange('state', e.target.value)}
                placeholder="SP" 
              />
            </div>
            <div className="space-y-2">
              <Label>Cidade</Label>
              <Input 
                value={formData.city}
                onChange={(e) => handleFieldChange('city', e.target.value)}
                placeholder="São Paulo" 
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Segmento</Label>
              <Select 
                value={formData.segment} 
                onValueChange={(value) => handleFieldChange('segment', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="importador">Importador</SelectItem>
                  <SelectItem value="distribuidor">Distribuidor</SelectItem>
                  <SelectItem value="varejo">Varejo</SelectItem>
                  <SelectItem value="atacado">Atacado</SelectItem>
                  <SelectItem value="industria">Indústria</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => handleFieldChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="desqualificado">Desqualificado</SelectItem>
                  <SelectItem value="em_negociacao">Em Negociação</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>WhatsApp</Label>
              <Input 
                value={formData.whatsapp}
                onChange={(e) => handleFieldChange('whatsapp', e.target.value)}
                placeholder="+55 11 9999-9999" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Observações Gerais</Label>
            <Textarea 
              value={formData.general_notes}
              onChange={(e) => handleFieldChange('general_notes', e.target.value)}
              placeholder="Informações adicionais sobre o contato..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={() => onOpenChange(false)} variant="outline" className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSubmit} className="flex-1" disabled={updateContactMutation.isPending}>
              {updateContactMutation.isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactEditModal;