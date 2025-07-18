import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCreateAccContract } from "@/hooks/useAccContracts";
import { toast } from "@/hooks/use-toast";
import DocumentUploader from "./DocumentUploader";

const formSchema = z.object({
  contract_number: z.string().min(1, "Número do contrato é obrigatório"),
  bank_name: z.string().min(2, "Nome do banco é obrigatório"),
  bank_code: z.string().optional(),
  contract_date: z.string().min(1, "Data do contrato é obrigatória"),
  maturity_date: z.string().min(1, "Data de vencimento é obrigatória"),
  amount_usd: z.string().min(1, "Valor em USD é obrigatório"),
  exchange_rate: z.string().min(1, "Taxa de câmbio é obrigatória"),
  interest_rate: z.string().min(1, "Taxa de juros é obrigatória"),
  advance_percentage: z.string().default("100"),
  iof_rate: z.string().default("0.38"),
  status: z.enum(["aberto", "liquidado", "vencido"]).default("aberto"),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AccContractFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function AccContractForm({ onSuccess, onCancel }: AccContractFormProps) {
  const [contractId, setContractId] = useState<string | null>(null);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      advance_percentage: "100",
      iof_rate: "0.38",
      status: "aberto",
    },
  });

  const createMutation = useCreateAccContract();

  const calculateValues = (amountUsd: number, exchangeRate: number, advancePercentage: number, iofRate: number) => {
    const amountBrl = amountUsd * exchangeRate;
    const advanceAmountUsd = (amountUsd * advancePercentage) / 100;
    const totalCost = amountBrl * (iofRate / 100);
    
    return {
      amount_brl: amountBrl,
      advance_amount_usd: advanceAmountUsd,
      total_cost: totalCost,
    };
  };

  const onSubmit = async (data: FormData) => {
    try {
      const amountUsd = parseFloat(data.amount_usd);
      const exchangeRate = parseFloat(data.exchange_rate);
      const advancePercentage = parseFloat(data.advance_percentage);
      const iofRate = parseFloat(data.iof_rate);

      const calculatedValues = calculateValues(amountUsd, exchangeRate, advancePercentage, iofRate);

      const contractData = {
        contract_number: data.contract_number,
        bank_name: data.bank_name,
        bank_code: data.bank_code,
        contract_date: data.contract_date,
        maturity_date: data.maturity_date,
        amount_usd: amountUsd,
        exchange_rate: exchangeRate,
        amount_brl: calculatedValues.amount_brl,
        interest_rate: parseFloat(data.interest_rate),
        advance_percentage: advancePercentage,
        advance_amount_usd: calculatedValues.advance_amount_usd,
        iof_rate: iofRate,
        total_cost: calculatedValues.total_cost,
        status: data.status as any,
        notes: data.notes,
      };

      const result = await createMutation.mutateAsync(contractData as any);
      setContractId(result.id);

      toast({
        title: "Sucesso",
        description: "Contrato ACC criado com sucesso!",
      });

      form.reset();
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar contrato ACC. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Watch values for real-time calculation
  const watchedValues = form.watch(["amount_usd", "exchange_rate", "advance_percentage", "iof_rate"]);
  const [amountUsd, exchangeRate, advancePercentage, iofRate] = watchedValues;

  const calculatedValues = React.useMemo(() => {
    if (amountUsd && exchangeRate && advancePercentage && iofRate) {
      return calculateValues(
        parseFloat(amountUsd), 
        parseFloat(exchangeRate), 
        parseFloat(advancePercentage), 
        parseFloat(iofRate)
      );
    }
    return null;
  }, [amountUsd, exchangeRate, advancePercentage, iofRate]);

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contract_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número do Contrato *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: ACC-2024-001" {...field} />
                      </FormControl>
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
                          <SelectItem value="aberto">Aberto</SelectItem>
                          <SelectItem value="liquidado">Liquidado</SelectItem>
                          <SelectItem value="vencido">Vencido</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bank_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Banco *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Banco do Brasil" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bank_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código do Banco</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contract_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data do Contrato *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maturity_date"
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Valores e Taxas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="amount_usd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor em USD *</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="exchange_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Taxa de Câmbio *</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.0001" placeholder="5.2000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="interest_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Taxa de Juros (% a.a.) *</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="12.50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="advance_percentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>% do Adiantamento</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="100.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="iof_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Taxa IOF (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.38" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {calculatedValues && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-6">
                    <h4 className="text-sm font-medium mb-3">Valores Calculados</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Valor em BRL</p>
                        <p className="font-medium">
                          R$ {calculatedValues.amount_brl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Adiantamento USD</p>
                        <p className="font-medium">
                          US$ {calculatedValues.advance_amount_usd.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Custo Total (IOF)</p>
                        <p className="font-medium">
                          R$ {calculatedValues.total_cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Digite observações adicionais sobre o contrato" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Salvando..." : "Salvar Contrato"}
            </Button>
          </div>
        </form>
      </Form>

      {contractId && (
        <>
          <Separator />
          <Card>
            <CardHeader>
              <CardTitle>Documentos do Contrato</CardTitle>
            </CardHeader>
            <CardContent>
              <DocumentUploader
                referenceId={contractId}
                referenceType="acc_contract"
                maxFiles={10}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}