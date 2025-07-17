import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useErrorHandler } from './useErrorHandler';
import type { Database } from '@/integrations/supabase/types';

type CrmContact = Database['public']['Tables']['crm_contacts']['Row'];
type CrmContactInsert = Database['public']['Tables']['crm_contacts']['Insert'];
type CrmContactUpdate = Database['public']['Tables']['crm_contacts']['Update'];

export const useCrmContacts = () => {
  const [contacts, setContacts] = useState<CrmContact[]>([]);
  const [loading, setLoading] = useState(true);
  const { handleError, handleSuccess } = useErrorHandler();

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('crm_contacts')
        .select(`
          *,
          assigned_to_profile:profiles!assigned_to(*),
          created_by_profile:profiles!created_by(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      handleError(error, 'buscar contatos');
    } finally {
      setLoading(false);
    }
  };

  const createContact = async (contact: CrmContactInsert) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('crm_contacts')
        .insert({
          ...contact,
          created_by: user.user.id,
        })
        .select(`
          *,
          assigned_to_profile:profiles!assigned_to(*),
          created_by_profile:profiles!created_by(*)
        `)
        .single();

      if (error) throw error;
      
      setContacts(prev => [data, ...prev]);
      handleSuccess('Contato criado com sucesso!');
      return data;
    } catch (error) {
      handleError(error, 'criar contato');
      throw error;
    }
  };

  const updateContact = async (id: string, updates: CrmContactUpdate) => {
    try {
      const { data, error } = await supabase
        .from('crm_contacts')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          assigned_to_profile:profiles!assigned_to(*),
          created_by_profile:profiles!created_by(*)
        `)
        .single();

      if (error) throw error;
      
      setContacts(prev => 
        prev.map(contact => contact.id === id ? data : contact)
      );
      
      handleSuccess('Contato atualizado com sucesso!');
      return data;
    } catch (error) {
      handleError(error, 'atualizar contato');
      throw error;
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  return {
    contacts,
    loading,
    createContact,
    updateContact,
    fetchContacts,
  };
};

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