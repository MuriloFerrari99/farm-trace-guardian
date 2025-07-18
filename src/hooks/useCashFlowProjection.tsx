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
      // Simular dados para os próximos 60 dias até a função RPC ser reconhecida
      const projectionData: CashFlowProjectionItem[] = [];
      const startDate = new Date();
      
      for (let i = 0; i < daysAhead; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        
        // Buscar fluxos reais do dia
        const { data: dailyFlows } = await supabase
          .from('cash_flow')
          .select('*')
          .eq('flow_date', currentDate.toISOString().split('T')[0]);
        
        const totalInflow = dailyFlows?.reduce((sum, flow) => 
          flow.flow_type === 'entrada' ? sum + Number(flow.amount_brl || 0) : sum, 0) || 0;
        
        const totalOutflow = dailyFlows?.reduce((sum, flow) => 
          flow.flow_type === 'saida' ? sum + Number(flow.amount_brl || 0) : sum, 0) || 0;
        
        const netFlow = totalInflow - totalOutflow;
        const previousBalance = i > 0 ? projectionData[i - 1].accumulated_balance : 0;
        
        projectionData.push({
          projection_date: currentDate.toISOString().split('T')[0],
          total_inflow: totalInflow,
          total_outflow: totalOutflow,
          net_flow: netFlow,
          accumulated_balance: previousBalance + netFlow
        });
      }

      return projectionData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}