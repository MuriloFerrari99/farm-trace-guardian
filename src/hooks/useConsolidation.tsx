import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type ConsolidatedLot = Database['public']['Tables']['consolidated_lots']['Row'] & {
  consolidated_lot_items: Array<
    Database['public']['Tables']['consolidated_lot_items']['Row'] & {
      receptions: Database['public']['Tables']['receptions']['Row'] & {
        producers: Database['public']['Tables']['producers']['Row'];
      };
    }
  >;
};

type NewConsolidation = {
  consolidation_code: string;
  client_name: string;
  product_type: string;
  total_quantity_kg: number;
  items: Array<{
    original_reception_id: string;
    quantity_used_kg: number;
  }>;
};

export const useConsolidation = () => {
  const queryClient = useQueryClient();

  const {
    data: consolidatedLots,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['consolidated-lots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('consolidated_lots')
        .select(`
          *,
          consolidated_lot_items(
            *,
            receptions:original_reception_id(
              *,
              producers(*)
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ConsolidatedLot[];
    },
  });

  const createConsolidation = useMutation({
    mutationFn: async (newConsolidation: NewConsolidation) => {
      const { data: user } = await supabase.auth.getUser();
      
      // Create consolidated lot
      const { data: consolidatedLot, error: consolidationError } = await supabase
        .from('consolidated_lots')
        .insert({
          consolidation_code: newConsolidation.consolidation_code,
          client_name: newConsolidation.client_name,
          product_type: newConsolidation.product_type,
          total_quantity_kg: newConsolidation.total_quantity_kg,
          consolidated_by: user.user?.id,
          consolidation_date: new Date().toISOString(),
          status: 'active'
        })
        .select()
        .single();

      if (consolidationError) throw consolidationError;

      // Create consolidated lot items
      const items = newConsolidation.items.map(item => ({
        ...item,
        consolidated_lot_id: consolidatedLot.id
      }));

      const { error: itemsError } = await supabase
        .from('consolidated_lot_items')
        .insert(items);

      if (itemsError) throw itemsError;

      return consolidatedLot;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consolidated-lots'] });
      queryClient.invalidateQueries({ queryKey: ['receptions'] });
      toast.success('Consolidação criada com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating consolidation:', error);
      toast.error('Erro ao criar consolidação');
    },
  });

  return {
    consolidatedLots,
    isLoading,
    error,
    createConsolidation,
  };
};