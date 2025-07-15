import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type StorageArea = Database['public']['Tables']['storage_areas']['Row'];
type StorageLocation = Database['public']['Tables']['storage_locations']['Row'];
type LotMovement = Database['public']['Tables']['lot_movements']['Row'];
type StorageChecklist = Database['public']['Tables']['storage_checklists']['Row'];
type CurrentLotPosition = Database['public']['Tables']['current_lot_positions']['Row'];

// Storage Areas
export const useStorageAreas = () => {
  return useQuery({
    queryKey: ['storage-areas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('storage_areas')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data as StorageArea[];
    },
  });
};

// Storage Locations
export const useStorageLocations = (areaId?: string) => {
  return useQuery({
    queryKey: ['storage-locations', areaId],
    queryFn: async () => {
      let query = supabase
        .from('storage_locations')
        .select(`
          *,
          storage_areas (
            name,
            zone_type
          )
        `)
        .order('location_code');

      if (areaId) {
        query = query.eq('area_id', areaId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

// Current Lot Positions with Reception details
export const useCurrentLotPositions = () => {
  return useQuery({
    queryKey: ['current-lot-positions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('current_lot_positions')
        .select(`
          *,
          receptions (
            reception_code,
            product_type,
            quantity_kg,
            lot_number,
            producers (
              name
            )
          ),
          storage_locations (
            location_code,
            storage_areas (
              name,
              zone_type
            )
          )
        `)
        .order('entry_date', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

// Lot Movements
export const useLotMovements = (receptionId?: string) => {
  return useQuery({
    queryKey: ['lot-movements', receptionId],
    queryFn: async () => {
      let query = supabase
        .from('lot_movements')
        .select(`
          *,
          receptions (
            reception_code,
            product_type
          ),
          from_location:storage_locations!lot_movements_from_location_id_fkey (
            location_code,
            storage_areas (name)
          ),
          to_location:storage_locations!lot_movements_to_location_id_fkey (
            location_code,
            storage_areas (name)
          ),
          profiles (
            name
          )
        `)
        .order('movement_date', { ascending: false });

      if (receptionId) {
        query = query.eq('reception_id', receptionId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

// Create Lot Movement
export const useCreateLotMovement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (movement: Database['public']['Tables']['lot_movements']['Insert']) => {
      const { data, error } = await supabase
        .from('lot_movements')
        .insert(movement)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lot-movements'] });
      queryClient.invalidateQueries({ queryKey: ['current-lot-positions'] });
      queryClient.invalidateQueries({ queryKey: ['storage-locations'] });
      toast.success('Movimentação registrada com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating lot movement:', error);
      toast.error('Erro ao registrar movimentação');
    },
  });
};

// Storage Checklists
export const useStorageChecklists = (receptionId?: string) => {
  return useQuery({
    queryKey: ['storage-checklists', receptionId],
    queryFn: async () => {
      let query = supabase
        .from('storage_checklists')
        .select(`
          *,
          receptions (
            reception_code,
            product_type
          ),
          storage_locations (
            location_code,
            storage_areas (name)
          ),
          profiles (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (receptionId) {
        query = query.eq('reception_id', receptionId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

// Create Storage Checklist
export const useCreateStorageChecklist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (checklist: Database['public']['Tables']['storage_checklists']['Insert']) => {
      const { data, error } = await supabase
        .from('storage_checklists')
        .insert(checklist)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storage-checklists'] });
      toast.success('Checklist registrado com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating storage checklist:', error);
      toast.error('Erro ao registrar checklist');
    },
  });
};

// Create Storage Location
export const useCreateStorageLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (location: Database['public']['Tables']['storage_locations']['Insert']) => {
      const { data, error } = await supabase
        .from('storage_locations')
        .insert(location)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storage-locations'] });
      toast.success('Localização criada com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating storage location:', error);
      toast.error('Erro ao criar localização');
    },
  });
};