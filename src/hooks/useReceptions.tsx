
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { generateReceptionCode } from '@/utils/codeGenerators';

type Reception = Database['public']['Tables']['receptions']['Row'] & {
  producer: Database['public']['Tables']['producers']['Row'];
  consolidated_lot_items?: Database['public']['Tables']['consolidated_lot_items']['Row'][];
  expedition_items?: Database['public']['Tables']['expedition_items']['Row'][];
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
          producer:producers(*),
          consolidated_lot_items!left (
            id,
            consolidated_lot_id
          ),
          expedition_items!left (
            id,
            expedition_id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Reception[];
    },
  });

  const createReception = useMutation({
    mutationFn: async (newReception: NewReception) => {
      // Generate automatic reception code if not provided
      const receptionData = {
        ...newReception,
        reception_code: newReception.reception_code || generateReceptionCode()
      };

      const { data, error } = await supabase
        .from('receptions')
        .insert(receptionData)
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

  const approveReception = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('receptions')
        .update({ 
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receptions'] });
      toast.success('Recebimento aprovado com sucesso!');
    },
    onError: (error) => {
      console.error('Error approving reception:', error);
      toast.error('Erro ao aprovar recebimento');
    },
  });

  const rejectReception = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('receptions')
        .update({ status: 'rejected' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receptions'] });
      toast.success('Recebimento rejeitado');
    },
    onError: (error) => {
      console.error('Error rejecting reception:', error);
      toast.error('Erro ao rejeitar recebimento');
    },
  });

  const deleteReception = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('receptions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receptions'] });
      toast.success('Recebimento deletado com sucesso!');
    },
    onError: (error) => {
      console.error('Error deleting reception:', error);
      toast.error('Erro ao deletar recebimento');
    },
  });

  return {
    receptions,
    isLoading,
    error,
    createReception,
    updateReception,
    approveReception,
    rejectReception,
    deleteReception,
  };
};
