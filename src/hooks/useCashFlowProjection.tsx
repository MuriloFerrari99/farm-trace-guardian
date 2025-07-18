import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CashFlowProjectionItem {
  projection_date: string;
  total_inflow: number;
  total_outflow: number;
  net_flow: number;
  accumulated_balance: number;
}

export function useCashFlowProjection(daysAhead: number = 60) {
  return useQuery({
    queryKey: ['cash-flow-projection', daysAhead],
    queryFn: async (): Promise<CashFlowProjectionItem[]> => {
      const { data, error } = await supabase.rpc('get_cash_flow_projection', {
        days_ahead: daysAhead
      });

      if (error) {
        console.error('Erro ao buscar projeção de fluxo de caixa:', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}