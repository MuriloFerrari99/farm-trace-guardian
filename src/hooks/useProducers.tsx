
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Producer = Database['public']['Tables']['producers']['Row'];

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
        .eq('is_active', true)
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
