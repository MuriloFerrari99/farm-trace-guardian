import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useDeleteContact = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contactId: string) => {
      // First check if contact has any dependencies
      const { data: interactions } = await supabase
        .from('crm_interactions')
        .select('id')
        .eq('contact_id', contactId)
        .limit(1);

      const { data: opportunities } = await supabase
        .from('crm_opportunities')
        .select('id')
        .eq('contact_id', contactId)
        .limit(1);

      if (interactions?.length || opportunities?.length) {
        throw new Error('Não é possível excluir este contato pois possui interações ou oportunidades vinculadas.');
      }

      const { error } = await supabase
        .from('crm_contacts')
        .delete()
        .eq('id', contactId);

      if (error) throw error;
      return contactId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-contacts'] });
      toast({
        title: "Sucesso",
        description: "Contato excluído com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};