
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Label = Database['public']['Tables']['labels']['Row'];
type NewLabel = Database['public']['Tables']['labels']['Insert'];

export const useLabels = () => {
  const queryClient = useQueryClient();

  const {
    data: labels,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['labels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('labels')
        .select(`
          *,
          reception:receptions(
            reception_code,
            product_type,
            quantity_kg,
            producer:producers(name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createLabel = useMutation({
    mutationFn: async (newLabel: NewLabel) => {
      const { data, error } = await supabase
        .from('labels')
        .insert(newLabel)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels'] });
      toast.success('Etiqueta criada com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating label:', error);
      toast.error('Erro ao criar etiqueta');
    },
  });

  const updateLabel = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Database['public']['Tables']['labels']['Update']>;
    }) => {
      const { data, error } = await supabase
        .from('labels')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels'] });
      toast.success('Etiqueta atualizada com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating label:', error);
      toast.error('Erro ao atualizar etiqueta');
    },
  });

  return {
    labels,
    isLoading,
    error,
    createLabel,
    updateLabel,
  };
};
