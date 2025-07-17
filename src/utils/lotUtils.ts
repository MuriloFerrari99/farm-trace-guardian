import type { Database } from '@/integrations/supabase/types';

type Reception = Database['public']['Tables']['receptions']['Row'] & {
  consolidated_lot_items?: Database['public']['Tables']['consolidated_lot_items']['Row'][];
  expedition_items?: Database['public']['Tables']['expedition_items']['Row'][];
};

export const isLotAvailable = (reception: Reception): boolean => {
  const notConsolidated = !reception.consolidated_lot_items || reception.consolidated_lot_items.length === 0;
  const notExpedited = !reception.expedition_items || reception.expedition_items.length === 0;
  return notConsolidated && notExpedited;
};

export const getLotStatus = (reception: Reception) => {
  const isConsolidated = reception.consolidated_lot_items && reception.consolidated_lot_items.length > 0;
  const isExpedited = reception.expedition_items && reception.expedition_items.length > 0;
  
  if (isExpedited) return 'expedited';
  if (isConsolidated) return 'consolidated';
  return 'available';
};

export const getLotStatusBadge = (status: string) => {
  switch (status) {
    case 'expedited':
      return { variant: 'secondary' as const, text: 'Expedido' };
    case 'consolidated':
      return { variant: 'outline' as const, text: 'Consolidado' };
    case 'available':
      return { variant: 'default' as const, text: 'Disponível' };
    default:
      return { variant: 'outline' as const, text: 'Indefinido' };
  }
};