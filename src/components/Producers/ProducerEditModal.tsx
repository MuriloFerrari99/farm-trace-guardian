import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useUpdateProducer } from '@/hooks/useProducers';
import { Database } from '@/integrations/supabase/types';

type Producer = Database['public']['Tables']['producers']['Row'];
type ProducerUpdate = Database['public']['Tables']['producers']['Update'];

const producerSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  ggn: z.string().optional(),
  certificate_number: z.string().optional(),
  certificate_expiry: z.string().min(1, "Data de vencimento do certificado é obrigatória"),
  farm_name: z.string().optional(),
  fruit_varieties: z.string().optional(),
  production_volume_tons: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  additional_notes: z.string().optional(),
});

type ProducerFormData = z.infer<typeof producerSchema>;

interface ProducerEditModalProps {
  producer: Producer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProducerEditModal = ({ producer, open, onOpenChange }: ProducerEditModalProps) => {
  const updateProducer = useUpdateProducer();
  
  const form = useForm<ProducerFormData>({
    resolver: zodResolver(producerSchema),
    defaultValues: {
      name: "",
      ggn: "",
      certificate_number: "",
      certificate_expiry: "",
      farm_name: "",
      fruit_varieties: "",
      production_volume_tons: "",
      email: "",
      phone: "",
      address: "",
      additional_notes: "",
    },
  });

  // Update form values when producer changes
  React.useEffect(() => {
    if (producer) {
      form.reset({
        name: producer.name || "",
        ggn: producer.ggn || "",
        certificate_number: producer.certificate_number || "",
        certificate_expiry: producer.certificate_expiry || "",
        farm_name: producer.farm_name || "",
        fruit_varieties: producer.fruit_varieties || "",
        production_volume_tons: producer.production_volume_tons?.toString() || "",
        email: producer.email || "",
        phone: producer.phone || "",
        address: producer.address || "",
        additional_notes: producer.additional_notes || "",
      });
    }
  }, [producer, form]);

  const onSubmit = async (data: ProducerFormData) => {
    if (!producer) return;

    const producerData: ProducerUpdate = {
      name: data.name,
      ggn: data.ggn || null,
      certificate_number: data.certificate_number || null,
      certificate_expiry: data.certificate_expiry,
      farm_name: data.farm_name || null,
      fruit_varieties: data.fruit_varieties || null,
      production_volume_tons: data.production_volume_tons ? parseFloat(data.production_volume_tons) : null,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      additional_notes: data.additional_notes || null,
    };

    try {
      await updateProducer.mutateAsync({ id: producer.id, ...producerData });
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating producer:', error);
    }
  };

  if (!producer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Produtor</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Produtor *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ggn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número GGN</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 4049928100001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="certificate_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número do Certificado</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: GGN-001-123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="certificate_expiry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vencimento do Certificado *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="farm_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Fazenda</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Fazenda São José" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fruit_varieties"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Variedades de Frutas</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Manga Palmer, Tommy Atkins" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="production_volume_tons"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Volume de Produção (Toneladas/ano)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1"
                        placeholder="Ex: 500.5" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(11) 99999-9999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Endereço completo da fazenda" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="additional_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações Adicionais</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Informações adicionais sobre o produtor"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={updateProducer.isPending}
              >
                {updateProducer.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};