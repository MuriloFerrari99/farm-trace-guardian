import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCreateAccountsReceivable } from "@/hooks/useFinancial";
import { toast } from "@/hooks/use-toast";

const formSchema = z.object({
  client_name: z.string().min(2, "Nome do cliente é obrigatório"),
  invoice_number: z.string().min(1, "Número da nota fiscal é obrigatório"),
  client_document: z.string().optional(),
  issue_date: z.string().min(1, "Data de emissão é obrigatória"),
  due_date: z.string().min(1, "Data de vencimento é obrigatória"),
  amount: z.string().min(1, "Valor é obrigatório"),
  currency: z.enum(["BRL", "USD", "EUR"]),
  exchange_rate: z.string().optional(),
  payment_method: z.enum(["dinheiro", "pix", "transferencia", "boleto", "cartao", "cheque"]).optional(),
  status: z.enum(["previsto", "atrasado", "pago", "cancelado"]).default("previsto"),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AccountsReceivableFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function AccountsReceivableForm({ onSuccess, onCancel }: AccountsReceivableFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currency: "BRL",
      exchange_rate: "1.0",
      status: "previsto",
    },
  });

  const createMutation = useCreateAccountsReceivable();

  const onSubmit = async (data: FormData) => {
    try {
      const amountBrl = data.currency === "BRL" 
        ? parseFloat(data.amount)
        : parseFloat(data.amount) * parseFloat(data.exchange_rate || "1");

      await createMutation.mutateAsync({
        client_name: data.client_name,
        invoice_number: data.invoice_number,
        client_document: data.client_document,
        issue_date: data.issue_date,
        due_date: data.due_date,
        amount: parseFloat(data.amount),
        currency: data.currency as any,
        exchange_rate: parseFloat(data.exchange_rate || "1"),
        amount_brl: amountBrl,
        payment_method: data.payment_method as any,
        status: data.status as any,
        notes: data.notes,
      });

      toast({
        title: "Sucesso",
        description: "Conta a receber criada com sucesso!",
      });

      form.reset();
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar conta a receber. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="client_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Cliente *</FormLabel>
                <FormControl>
                  <Input placeholder="Digite o nome do cliente" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="invoice_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número da Nota Fiscal *</FormLabel>
                <FormControl>
                  <Input placeholder="Digite o número da NF" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="client_document"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Documento do Cliente</FormLabel>
              <FormControl>
                <Input placeholder="CPF/CNPJ" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="issue_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Emissão *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="due_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Vencimento *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor *</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a moeda" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="BRL">BRL - Real</SelectItem>
                    <SelectItem value="USD">USD - Dólar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="exchange_rate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Taxa de Câmbio</FormLabel>
                <FormControl>
                  <Input type="number" step="0.0001" placeholder="1.0000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="payment_method"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Forma de Pagamento</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a forma de pagamento" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="transferencia">Transferência</SelectItem>
                    <SelectItem value="boleto">Boleto</SelectItem>
                    <SelectItem value="cartao">Cartão</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="previsto">Previsto</SelectItem>
                    <SelectItem value="atrasado">Atrasado</SelectItem>
                    <SelectItem value="pago">Pago</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea placeholder="Digite observações adicionais" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}