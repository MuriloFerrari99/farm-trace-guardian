import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useCrmInteractions = (contactId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: interactions, isLoading } = useQuery({
    queryKey: ['crm-interactions', contactId],
    queryFn: async () => {
      let query = supabase
        .from('crm_interactions')
        .select(`
          *,
          contact:crm_contacts(company_name, contact_name),
          created_by_profile:profiles!crm_interactions_created_by_fkey(name)
        `)
        .order('interaction_date', { ascending: false });

      if (contactId) {
        query = query.eq('contact_id', contactId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: true
  });

  const createInteractionMutation = useMutation({
    mutationFn: async (interactionData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('crm_interactions')
        .insert([{
          ...interactionData,
          created_by: user.id
        }])
        .select(`
          *,
          contact:crm_contacts(company_name, contact_name),
          created_by_profile:profiles!crm_interactions_created_by_fkey(name)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-interactions'] });
      queryClient.invalidateQueries({ queryKey: ['crm-contacts'] });
      toast({
        title: "Sucesso",
        description: "Interação registrada com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao registrar interação: " + error.message,
        variant: "destructive",
      });
    }
  });

  return {
    interactions,
    isLoading,
    createInteraction: createInteractionMutation.mutate,
    isCreating: createInteractionMutation.isPending
  };
};