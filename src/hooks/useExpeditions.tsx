import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

type Expedition = Tables<'expeditions'>;
type ExpeditionItem = Tables<'expedition_items'>;
type Reception = Tables<'receptions'>;

interface ExpeditionWithItems extends Expedition {
  expedition_items: (ExpeditionItem & {
    receptions: Reception & {
      producers: Tables<'producers'>;
    };
  })[];
}

interface CreateExpeditionData {
  expedition_code: string;
  destination: string;
  expedition_date: string;
  total_weight_kg: number;
  transporter?: string;
  vehicle_plate?: string;
  consolidations: {
    consolidated_lot_id: string;
  }[];
}

export const useExpeditions = () => {
  const [expeditions, setExpeditions] = useState<ExpeditionWithItems[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchExpeditions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('expeditions')
        .select(`
          *,
          expedition_items (
            *,
            receptions (
              *,
              producers (*)
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExpeditions(data || []);
    } catch (error) {
      console.error('Error fetching expeditions:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar expedições",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateNextExpeditionCode = async () => {
    try {
      const { data, error } = await supabase
        .from('expeditions')
        .select('expedition_code')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      
      const lastCode = data && data.length > 0 ? data[0].expedition_code : '';
      const match = lastCode.match(/EXP-(\d+)$/);
      const nextNumber = match ? parseInt(match[1]) + 1 : 1;
      
      return `EXP-${String(nextNumber).padStart(3, '0')}`;
    } catch (error) {
      console.error('Error generating expedition code:', error);
      return `EXP-001`;
    }
  };

  const createExpedition = async (expeditionData: CreateExpeditionData) => {
    setLoading(true);
    try {
      // Generate automatic expedition code if not provided
      const expeditionCode = expeditionData.expedition_code || await generateNextExpeditionCode();
      
      // Create expedition
      const { data: expedition, error: expeditionError } = await supabase
        .from('expeditions')
        .insert({
          expedition_code: expeditionCode,
          destination: expeditionData.destination,
          expedition_date: expeditionData.expedition_date,
          total_weight_kg: expeditionData.total_weight_kg,
          transporter: expeditionData.transporter,
          vehicle_plate: expeditionData.vehicle_plate,
        })
        .select()
        .single();

      if (expeditionError) throw expeditionError;

      // Create expedition items from consolidations
      if (expeditionData.consolidations.length > 0) {
        const items = expeditionData.consolidations.map(consolidation => ({
          expedition_id: expedition.id,
          consolidated_lot_id: consolidation.consolidated_lot_id,
          quantity_kg: 0, // Will be calculated from consolidation total
        }));

        const { error: itemsError } = await supabase
          .from('expedition_items')
          .insert(items);

        if (itemsError) throw itemsError;
      }

      toast({
        title: "Sucesso",
        description: "Expedição criada com sucesso",
      });

      await fetchExpeditions();
      return expedition;
    } catch (error) {
      console.error('Error creating expedition:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar expedição",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteExpedition = async (expeditionId: string) => {
    try {
      // First delete expedition items
      const { error: itemsError } = await supabase
        .from('expedition_items')
        .delete()
        .eq('expedition_id', expeditionId);

      if (itemsError) throw itemsError;

      // Then delete the expedition
      const { error: expeditionError } = await supabase
        .from('expeditions')
        .delete()
        .eq('id', expeditionId);

      if (expeditionError) throw expeditionError;

      toast({
        title: "Sucesso",
        description: "Expedição excluída com sucesso",
      });

      await fetchExpeditions();
    } catch (error) {
      console.error('Error deleting expedition:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir expedição",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getAvailableConsolidations = async () => {
    try {
      const { data, error } = await supabase
        .from('consolidated_lots')
        .select(`
          *,
          consolidated_lot_items (
            *,
            receptions:original_reception_id (
              *,
              producers (*)
            )
          ),
          expedition_items!left (
            id,
            expedition_id
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Filter out consolidations that have already been expedited
      const availableConsolidations = (data || []).filter(consolidation => {
        const notExpedited = !consolidation.expedition_items || consolidation.expedition_items.length === 0;
        return notExpedited;
      });
      
      return availableConsolidations;
    } catch (error) {
      console.error('Error fetching available consolidations:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar consolidações disponíveis",
        variant: "destructive",
      });
      return [];
    }
  };

  useEffect(() => {
    fetchExpeditions();
  }, []);

  return {
    expeditions,
    loading,
    createExpedition,
    deleteExpedition,
    getAvailableConsolidations,
    generateNextExpeditionCode,
    refetch: fetchExpeditions,
  };
};