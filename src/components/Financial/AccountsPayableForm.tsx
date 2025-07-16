import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateAccountsPayable } from '@/hooks/useFinancial';
import { Database } from '@/integrations/supabase/types';

type AccountsPayableInsert = Database['public']['Tables']['accounts_payable']['Insert'];

const payableSchema = z.object({
  supplier_name: z.string().min(1, 'Nome do fornecedor é obrigatório'),
  invoice_number: z.string().optional(),
  amount: z.number().min(0.01, 'Valor deve ser maior que zero'),
  currency: z.enum(['BRL', 'USD', 'EUR', 'ARS', 'CNY']).default('BRL'),
  issue_date: z.string().min(1, 'Data de emissão é obrigatória'),
  due_date: z.string().min(1, 'Data de vencimento é obrigatória'),
  payment_method: z.enum(['boleto', 'transferencia', 'cheque', 'cartao', 'pix', 'swift']).optional(),
  supplier_document: z.string().optional(),
  notes: z.string().optional(),
});

type PayableFormData = z.infer<typeof payableSchema>;

interface AccountsPayableFormProps {
  onSuccess?: () => void;
}

export const AccountsPayableForm: React.FC<AccountsPayableFormProps> = ({ onSuccess }) => {
  const createPayable = useCreateAccountsPayable();

  const form = useForm<PayableFormData>({
    resolver: zodResolver(payableSchema),
    defaultValues: {
      supplier_name: '',
      invoice_number: '',
      amount: 0,
      currency: 'BRL',
      issue_date: new Date().toISOString().split('T')[0],
      due_date: '',
      payment_method: undefined,
      supplier_document: '',
      notes: '',
    },
  });

  const onSubmit = async (data: PayableFormData) => {
    const payableData: AccountsPayableInsert = {
      supplier_name: data.supplier_name,
      invoice_number: data.invoice_number || null,
      amount: data.amount,
      currency: data.currency,
      exchange_rate: data.currency === 'BRL' ? 1.0 : null,
      amount_brl: data.currency === 'BRL' ? data.amount : null,
      issue_date: data.issue_date,
      due_date: data.due_date,
      payment_method: data.payment_method || null,
      supplier_document: data.supplier_document || null,
      notes: data.notes || null,
    };

    createPayable.mutate(payableData, {
      onSuccess: () => {
        form.reset();
        onSuccess?.();
      },
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="supplier_name">Fornecedor *</Label>
          <Input
            id="supplier_name"
            placeholder="Nome do fornecedor"
            {...form.register('supplier_name')}
          />
          {form.formState.errors.supplier_name && (
            <p className="text-sm text-red-600">{form.formState.errors.supplier_name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="invoice_number">Número da Fatura</Label>
          <Input
            id="invoice_number"
            placeholder="Ex: NF-2024-001"
            {...form.register('invoice_number')}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Valor *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            placeholder="0,00"
            {...form.register('amount', { valueAsNumber: true })}
          />
          {form.formState.errors.amount && (
            <p className="text-sm text-red-600">{form.formState.errors.amount.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Moeda</Label>
          <Select onValueChange={(value) => form.setValue('currency', value as any)}>
            <SelectTrigger>
              <SelectValue placeholder="BRL" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BRL">BRL - Real</SelectItem>
              <SelectItem value="USD">USD - Dólar</SelectItem>
              <SelectItem value="EUR">EUR - Euro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Forma de Pagamento</Label>
          <Select onValueChange={(value) => form.setValue('payment_method', value as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pix">PIX</SelectItem>
              <SelectItem value="transferencia">Transferência</SelectItem>
              <SelectItem value="boleto">Boleto</SelectItem>
              <SelectItem value="cheque">Cheque</SelectItem>
              <SelectItem value="cartao">Cartão</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="issue_date">Data de Emissão *</Label>
          <Input
            id="issue_date"
            type="date"
            {...form.register('issue_date')}
          />
          {form.formState.errors.issue_date && (
            <p className="text-sm text-red-600">{form.formState.errors.issue_date.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="due_date">Data de Vencimento *</Label>
          <Input
            id="due_date"
            type="date"
            {...form.register('due_date')}
          />
          {form.formState.errors.due_date && (
            <p className="text-sm text-red-600">{form.formState.errors.due_date.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Input
          id="notes"
          placeholder="Observações sobre a conta"
          {...form.register('notes')}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button 
          type="submit" 
          disabled={createPayable.isPending}
          className="flex-1"
        >
          {createPayable.isPending ? 'Salvando...' : 'Salvar Conta'}
        </Button>
      </div>
    </form>
  );
};