
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useCreateProducer } from '@/hooks/useProducers';
import { Database } from '@/integrations/supabase/types';

type ProducerInsert = Database['public']['Tables']['producers']['Insert'];

const producerSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  ggn: z.string().optional(),
  certificate_number: z.string().optional(),
  certificate_expiry: z.string().min(1, 'Data de validade é obrigatória'),
  farm_name: z.string().optional(),
  fruit_varieties: z.string().optional(),
  additional_notes: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
});

type ProducerFormData = z.infer<typeof producerSchema>;

export const ProducerForm = () => {
  const createProducer = useCreateProducer();

  const form = useForm<ProducerFormData>({
    resolver: zodResolver(producerSchema),
    defaultValues: {
      name: '',
      ggn: '',
      certificate_number: '',
      certificate_expiry: '',
      farm_name: '',
      fruit_varieties: '',
      additional_notes: '',
      address: '',
      phone: '',
      email: '',
    },
  });

  const onSubmit = async (data: ProducerFormData) => {
    const producerData: ProducerInsert = {
      name: data.name,
      ggn: data.ggn || null,
      certificate_number: data.certificate_number || null,
      certificate_expiry: data.certificate_expiry,
      farm_name: data.farm_name || null,
      fruit_varieties: data.fruit_varieties || null,
      additional_notes: data.additional_notes || null,
      email: data.email || null,
      address: data.address || null,
      phone: data.phone || null,
    };

    createProducer.mutate(producerData, {
      onSuccess: () => {
        form.reset();
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cadastrar Novo Produtor</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do produtor" {...field} />
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
                    <FormLabel>GGN</FormLabel>
                    <FormControl>
                      <Input placeholder="Número GGN" {...field} />
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
                    <FormLabel>Qual Certificado o produtor possui</FormLabel>
                    <FormControl>
                      <Input placeholder="Número do certificado" {...field} />
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
                    <FormLabel>Validade do Certificado *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                      <Input placeholder="Telefone" {...field} />
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
                      <Input type="email" placeholder="Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="farm_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Fazenda</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da fazenda" {...field} />
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
                    <FormLabel>Variedades de frutas produzidas</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Tomate, Alface, Pepino" {...field} />
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
                    <Input placeholder="Endereço completo" {...field} />
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
                  <FormLabel>Observações adicionais</FormLabel>
                  <FormControl>
                    <Input placeholder="Observações sobre o produtor" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              disabled={createProducer.isPending}
              className="w-full md:w-auto"
            >
              {createProducer.isPending ? 'Cadastrando...' : 'Cadastrar Produtor'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
