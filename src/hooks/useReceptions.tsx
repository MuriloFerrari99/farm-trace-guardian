
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Reception = Database['public']['Tables']['receptions']['Row'] & {
  producer: Database['public']['Tables']['producers']['Row'];
};

type NewReception = Database['public']['Tables']['receptions']['Insert'];

export const useReceptions = () => {
  const queryClient = useQueryClient();

  const {
    data: receptions,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['receptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('receptions')
        .select(`
          *,
          producer:producers(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Reception[];
    },
  });

  const createReception = useMutation({
    mutationFn: async (newReception: NewReception) => {
      const { data, error } = await supabase
        .from('receptions')
        .insert(newReception)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receptions'] });
      toast.success('Recebimento criado com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating reception:', error);
      toast.error('Erro ao criar recebimento');
    },
  });

  const updateReception = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Database['public']['Tables']['receptions']['Update']>;
    }) => {
      const { data, error } = await supabase
        .from('receptions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receptions'] });
      toast.success('Recebimento atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating reception:', error);
      toast.error('Erro ao atualizar recebimento');
    },
  });

  return {
    receptions,
    isLoading,
    error,
    createReception,
    updateReception,
  };
};
