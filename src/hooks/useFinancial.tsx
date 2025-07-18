
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useErrorHandler } from './useErrorHandler';

// Hook para contas a pagar
export const useAccountsPayable = () => {
  const { data: payables, isLoading, error } = useQuery({
    queryKey: ['accounts-payable'],
    queryFn: async () => {
      const response = await apiClient.getAccountsPayable();
      return response.data;
    },
  });

  return { payables, isLoading, error };
};

export const useCreateAccountsPayable = () => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation({
    mutationFn: async (payable: any) => {
      const response = await apiClient.createAccountsPayable(payable);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts-payable'] });
      handleSuccess('Conta a pagar criada com sucesso!');
    },
    onError: (error: any) => {
      handleError(error, 'criação de conta a pagar');
    },
  });
};

// Hook para contas a receber
export const useAccountsReceivable = () => {
  const { data: receivables, isLoading, error } = useQuery({
    queryKey: ['accounts-receivable'],
    queryFn: async () => {
      const response = await apiClient.getAccountsReceivable();
      return response.data;
    },
  });

  return { receivables, isLoading, error };
};

export const useCreateAccountsReceivable = () => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation({
    mutationFn: async (receivable: any) => {
      const response = await apiClient.post('/financial/accounts-receivable', receivable);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts-receivable'] });
      handleSuccess('Conta a receber criada com sucesso!');
    },
    onError: (error: any) => {
      handleError(error, 'criação de conta a receber');
    },
  });
};

// Hook para fluxo de caixa
export const useCashFlow = (startDate?: string, endDate?: string) => {
  const { data: cashFlow, isLoading, error } = useQuery({
    queryKey: ['cash-flow', startDate, endDate],
    queryFn: async () => {
      const response = await apiClient.getCashFlow(startDate, endDate);
      return response.data;
    },
  });

  return { cashFlow, isLoading, error };
};

export const useCashFlowProjection = (daysAhead: number = 60) => {
  const { data: projection, isLoading, error } = useQuery({
    queryKey: ['cash-flow-projection', daysAhead],
    queryFn: async () => {
      const response = await apiClient.getCashFlowProjection(daysAhead);
      return response.data;
    },
  });

  return { projection, isLoading, error };
};
