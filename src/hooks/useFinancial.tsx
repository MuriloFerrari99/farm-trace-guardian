import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useErrorHandler } from './useErrorHandler';

type AccountsPayable = Database['public']['Tables']['accounts_payable']['Row'] & {
  producers?: { name: string } | null;
  receptions?: { reception_code: string } | null;
};
type AccountsPayableInsert = Database['public']['Tables']['accounts_payable']['Insert'];
type AccountsReceivable = Database['public']['Tables']['accounts_receivable']['Row'];
type AccountsReceivableInsert = Database['public']['Tables']['accounts_receivable']['Insert'];

// Hook para contas a pagar
export const useAccountsPayable = () => {
  const { data: payables, isLoading, error } = useQuery({
    queryKey: ['accounts-payable'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('accounts_payable')
        .select(`
          *,
          producers(name),
          receptions(reception_code)
        `)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data as AccountsPayable[];
    },
  });

  return { payables, isLoading, error };
};

export const useCreateAccountsPayable = () => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation({
    mutationFn: async (payable: AccountsPayableInsert) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('accounts_payable')
        .insert({
          ...payable,
          created_by: session.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts-payable'] });
      handleSuccess('Conta a pagar criada com sucesso!');
    },
    onError: (error) => {
      handleError(error, 'criação de conta a pagar');
    },
  });
};

// Hook para contas a receber
export const useAccountsReceivable = () => {
  const { data: receivables, isLoading, error } = useQuery({
    queryKey: ['accounts-receivable'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('accounts_receivable')
        .select(`
          *,
          expeditions(expedition_code),
          acc_contracts(contract_number),
          letter_of_credit(lc_number)
        `)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data as AccountsReceivable[];
    },
  });

  return { receivables, isLoading, error };
};

export const useCreateAccountsReceivable = () => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation({
    mutationFn: async (receivable: AccountsReceivableInsert) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('accounts_receivable')
        .insert({
          ...receivable,
          created_by: session.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts-receivable'] });
      handleSuccess('Conta a receber criada com sucesso!');
    },
    onError: (error) => {
      handleError(error, 'criação de conta a receber');
    },
  });
};