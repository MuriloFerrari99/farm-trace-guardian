
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Producer = Database['public']['Tables']['producers']['Row'];
type ProducerInsert = Database['public']['Tables']['producers']['Insert'];
type ProducerUpdate = Database['public']['Tables']['producers']['Update'];

export const useProducers = () => {
  const {
    data: producers,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['producers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('producers')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as Producer[];
    },
  });

  return {
    producers,
    isLoading,
    error,
  };
};

export const useCreateProducer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (producer: ProducerInsert) => {
      const { data, error } = await supabase
        .from('producers')
        .insert(producer)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['producers'] });
      toast.success('Produtor criado com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating producer:', error);
      toast.error('Erro ao criar produtor');
    },
  });
};

export const useUpdateProducer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: ProducerUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('producers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['producers'] });
      toast.success('Produtor atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating producer:', error);
      toast.error('Erro ao atualizar produtor');
    },
  });
};

export const useDeleteProducer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('producers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['producers'] });
      toast.success('Produtor removido com sucesso!');
    },
    onError: (error) => {
      console.error('Error deleting producer:', error);
      toast.error('Erro ao remover produtor');
    },
  });
};
