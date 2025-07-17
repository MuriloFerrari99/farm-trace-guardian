import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Label = Database['public']['Tables']['labels']['Row'];
type NewLabel = Database['public']['Tables']['labels']['Insert'];

export const useLabels = () => {
  const queryClient = useQueryClient();

  const { data: labels, isLoading, error } = useQuery({
    queryKey: ['labels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('labels')
        .select(`
          *,
          receptions:reception_id (
            *,
            producers (*)
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
      toast.success('Rótulo criado com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating label:', error);
      toast.error('Erro ao criar rótulo');
    },
  });

  const printLabel = useMutation({
    mutationFn: async (id: string) => {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('labels')
        .update({
          printed_at: new Date().toISOString(),
          printed_by: user.user?.id,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels'] });
      toast.success('Rótulo marcado como impresso!');
    },
    onError: (error) => {
      console.error('Error updating label:', error);
      toast.error('Erro ao atualizar rótulo');
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
      toast.success('Rótulo atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating label:', error);
      toast.error('Erro ao atualizar rótulo');
    },
  });

  const deleteLabel = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('labels')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels'] });
      toast.success('Rótulo excluído com sucesso!');
    },
    onError: (error) => {
      console.error('Error deleting label:', error);
      toast.error('Erro ao excluir rótulo');
    },
  });

  return {
    labels,
    isLoading,
    error,
    createLabel,
    updateLabel,
    printLabel,
    deleteLabel,
  };
};