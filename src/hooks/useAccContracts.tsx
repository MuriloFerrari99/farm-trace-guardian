import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useErrorHandler } from "./useErrorHandler";

interface AccContract {
  id: string;
  contract_number: string;
  bank_name: string;
  bank_code?: string;
  contract_date: string;
  maturity_date: string;
  amount_usd: number;
  exchange_rate: number;
  amount_brl?: number;
  interest_rate: number;
  advance_percentage?: number;
  advance_amount_usd?: number;
  iof_rate?: number;
  total_cost?: number;
  status: 'aberto' | 'liquidado' | 'vencido' | 'cancelado';
  liquidation_date?: string;
  liquidation_rate?: number;
  expedition_id?: string;
  producer_id?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

interface AccContractInsert {
  contract_number: string;
  bank_name: string;
  bank_code?: string;
  contract_date: string;
  maturity_date: string;
  amount_usd: number;
  exchange_rate: number;
  amount_brl?: number;
  interest_rate: number;
  advance_percentage?: number;
  advance_amount_usd?: number;
  iof_rate?: number;
  total_cost?: number;
  status?: 'aberto' | 'liquidado' | 'vencido' | 'cancelado';
  liquidation_date?: string;
  liquidation_rate?: number;
  expedition_id?: string;
  producer_id?: string;
  notes?: string;
}

export function useAccContracts() {
  const { handleError } = useErrorHandler();

  return useQuery({
    queryKey: ['acc-contracts'],
    queryFn: async (): Promise<AccContract[]> => {
      const { data, error } = await supabase
        .from('acc_contracts')
        .select(`
          *
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    },
  });
}

export function useCreateAccContract() {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: async (contractData: AccContractInsert) => {
      const { data, error } = await supabase
        .from('acc_contracts')
        .insert(contractData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['acc-contracts'] });
    },
  });
}

export function useUpdateAccContract() {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<AccContractInsert> }) => {
      const { data, error } = await supabase
        .from('acc_contracts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['acc-contracts'] });
    },
  });
}

export function useDeleteAccContract() {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('acc_contracts')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['acc-contracts'] });
    },
    onError: handleError,
  });
}