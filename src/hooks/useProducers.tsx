
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useErrorHandler } from './useErrorHandler';

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
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation({
    mutationFn: async (producer: ProducerInsert) => {
      console.log('Creating producer with data:', producer);
      
      // Validate auth session before making request
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Usuário não autenticado');
      }
      
      const { data, error } = await supabase
        .from('producers')
        .insert(producer)
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating producer:', error);
        throw error;
      }
      
      console.log('Producer created successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('Producer creation success callback:', data);
      queryClient.invalidateQueries({ queryKey: ['producers'] });
      handleSuccess('Produtor criado com sucesso!');
    },
    onError: (error: any) => {
      handleError(error, 'criação de produtor');
    },
  });
};

export const useUpdateProducer = () => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation({
    mutationFn: async ({ id, ...updates }: ProducerUpdate & { id: string }) => {
      // Validate auth session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Usuário não autenticado');
      }
      
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
      handleSuccess('Produtor atualizado com sucesso!');
    },
    onError: (error) => {
      handleError(error, 'atualização de produtor');
    },
  });
};

export const useDeleteProducer = () => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation({
    mutationFn: async (id: string) => {
      // Validate auth session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Usuário não autenticado');
      }
      
      const { error } = await supabase
        .from('producers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['producers'] });
      handleSuccess('Produtor removido com sucesso!');
    },
    onError: (error) => {
      handleError(error, 'remoção de produtor');
    },
  });
};
