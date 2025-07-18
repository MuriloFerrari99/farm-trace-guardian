
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

export const useCrmInteractions = (contactId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: interactions, isLoading } = useQuery({
    queryKey: ['crm-interactions', contactId],
    queryFn: async () => {
      let url = '/crm/interactions';
      if (contactId) {
        url += `?contact_id=${contactId}`;
      }
      const response = await apiClient.get(url);
      return response.data;
    },
    enabled: true
  });

  const createInteractionMutation = useMutation({
    mutationFn: async (interactionData: any) => {
      const response = await apiClient.createInteraction(interactionData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-interactions'] });
      queryClient.invalidateQueries({ queryKey: ['crm-contacts'] });
      toast({
        title: "Sucesso",
        description: "Interação registrada com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: "Erro ao registrar interação: " + (error.response?.data?.detail || error.message),
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
