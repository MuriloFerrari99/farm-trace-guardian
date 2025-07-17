import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useCrmContacts } from '@/hooks/useCrmContacts';
import { useCrmOpportunities } from '@/hooks/useCrmOpportunities';
import type { Database } from '@/integrations/supabase/types';

type CrmOpportunity = Database['public']['Tables']['crm_opportunities']['Row'];

const opportunitySchema = z.object({
  contact_id: z.string().min(1, 'Selecione um contato'),
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  stage: z.enum(['contato_inicial', 'qualificado', 'proposta_enviada', 'negociacao', 'fechado_ganhou', 'fechado_perdeu']),
  estimated_value: z.number().min(0).optional(),
  currency: z.string().default('BRL'),
  probability: z.number().min(0).max(100).optional(),
  expected_close_date: z.date().optional(),
  product_interest: z.string().optional(),
  assigned_to: z.string().optional(),
});

type OpportunityFormData = z.infer<typeof opportunitySchema>;

interface NewOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactId?: string;
  opportunity?: CrmOpportunity;
}

const STAGE_OPTIONS = [
  { value: 'contato_inicial', label: 'Contato Inicial' },
  { value: 'qualificado', label: 'Qualificado' },
  { value: 'proposta_enviada', label: 'Proposta Enviada' },
  { value: 'negociacao', label: 'Negociação' },
  { value: 'fechado_ganhou', label: 'Fechado (Ganhou)' },
  { value: 'fechado_perdeu', label: 'Fechado (Perdeu)' },
];

export const NewOpportunityModal: React.FC<NewOpportunityModalProps> = ({
  isOpen,
  onClose,
  contactId,
  opportunity,
}) => {
  const { contacts } = useCrmContacts();
  const { createOpportunity, updateOpportunity } = useCrmOpportunities();
  
  const form = useForm<OpportunityFormData>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: {
      contact_id: contactId || opportunity?.contact_id || '',
      title: opportunity?.title || '',
      description: opportunity?.description || '',
      stage: opportunity?.stage || 'contato_inicial',
      estimated_value: opportunity?.estimated_value || undefined,
      currency: opportunity?.currency || 'BRL',
      probability: opportunity?.probability || 50,
      expected_close_date: opportunity?.expected_close_date ? new Date(opportunity.expected_close_date) : undefined,
      product_interest: opportunity?.product_interest || '',
      assigned_to: opportunity?.assigned_to || '',
    },
  });

  const handleSubmit = async (data: OpportunityFormData) => {
    try {
      const submitData = {
        contact_id: data.contact_id,
        title: data.title,
        description: data.description || null,
        stage: data.stage,
        estimated_value: data.estimated_value || null,
        currency: data.currency,
        probability: data.probability || null,
        expected_close_date: data.expected_close_date?.toISOString().split('T')[0] || null,
        product_interest: data.product_interest || null,
        assigned_to: data.assigned_to || null,
      };

      if (opportunity) {
        await updateOpportunity(opportunity.id, submitData);
      } else {
        await createOpportunity(submitData);
      }
      
      form.reset();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar oportunidade:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {opportunity ? 'Editar Oportunidade' : 'Nova Oportunidade'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contact_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contato *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um contato" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {contacts.map((contact) => (
                          <SelectItem key={contact.id} value={contact.id}>
                            {contact.company_name} - {contact.contact_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estágio</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STAGE_OPTIONS.map((stage) => (
                          <SelectItem key={stage.value} value={stage.value}>
                            {stage.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Venda de 1000kg de abacate" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Detalhes da oportunidade..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="estimated_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Estimado</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Moeda</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="BRL">BRL (Real)</SelectItem>
                        <SelectItem value="USD">USD (Dólar)</SelectItem>
                        <SelectItem value="EUR">EUR (Euro)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="probability"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Probabilidade (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        min="0"
                        max="100"
                        placeholder="50"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="expected_close_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data Prevista de Fechamento</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'dd/MM/yyyy', { locale: ptBR })
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="product_interest"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Produto de Interesse</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Abacate Hass" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">
                {opportunity ? 'Atualizar' : 'Criar'} Oportunidade
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};