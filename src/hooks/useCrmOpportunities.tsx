import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useErrorHandler } from './useErrorHandler';
import type { Database } from '@/integrations/supabase/types';

type CrmOpportunity = Database['public']['Tables']['crm_opportunities']['Row'];
type CrmOpportunityInsert = Database['public']['Tables']['crm_opportunities']['Insert'];
type CrmOpportunityUpdate = Database['public']['Tables']['crm_opportunities']['Update'];

export const useCrmOpportunities = () => {
  const [opportunities, setOpportunities] = useState<CrmOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const { handleError, handleSuccess } = useErrorHandler();

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('crm_opportunities')
        .select(`
          *,
          contact:crm_contacts(*),
          assigned_to_profile:profiles!assigned_to(*),
          created_by_profile:profiles!created_by(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOpportunities(data || []);
    } catch (error) {
      handleError(error, 'buscar oportunidades');
    } finally {
      setLoading(false);
    }
  };

  const createOpportunity = async (opportunity: CrmOpportunityInsert) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('crm_opportunities')
        .insert({
          ...opportunity,
          created_by: user.user.id,
        })
        .select(`
          *,
          contact:crm_contacts(*),
          assigned_to_profile:profiles!assigned_to(*),
          created_by_profile:profiles!created_by(*)
        `)
        .single();

      if (error) throw error;
      
      setOpportunities(prev => [data, ...prev]);
      handleSuccess('Oportunidade criada com sucesso!');
      return data;
    } catch (error) {
      handleError(error, 'criar oportunidade');
      throw error;
    }
  };

  const updateOpportunity = async (id: string, updates: CrmOpportunityUpdate) => {
    try {
      const { data, error } = await supabase
        .from('crm_opportunities')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          contact:crm_contacts(*),
          assigned_to_profile:profiles!assigned_to(*),
          created_by_profile:profiles!created_by(*)
        `)
        .single();

      if (error) throw error;
      
      setOpportunities(prev => 
        prev.map(opp => opp.id === id ? data : opp)
      );
      
      handleSuccess('Oportunidade atualizada com sucesso!');
      return data;
    } catch (error) {
      handleError(error, 'atualizar oportunidade');
      throw error;
    }
  };

  const getOpportunitiesByStage = () => {
    const stages = {
      contato_inicial: opportunities.filter(o => o.stage === 'contato_inicial'),
      qualificado: opportunities.filter(o => o.stage === 'qualificado'),
      proposta_enviada: opportunities.filter(o => o.stage === 'proposta_enviada'),
      negociacao: opportunities.filter(o => o.stage === 'negociacao'),
      fechado_ganhou: opportunities.filter(o => o.stage === 'fechado_ganhou'),
      fechado_perdeu: opportunities.filter(o => o.stage === 'fechado_perdeu'),
    };
    
    return stages;
  };

  const getStageStats = () => {
    const stages = getOpportunitiesByStage();
    
    return {
      total: opportunities.length,
      won: stages.fechado_ganhou.length,
      lost: stages.fechado_perdeu.length,
      active: opportunities.filter(o => 
        !['fechado_ganhou', 'fechado_perdeu'].includes(o.stage)
      ).length,
      totalValue: opportunities
        .filter(o => o.stage === 'fechado_ganhou')
        .reduce((sum, o) => sum + (o.estimated_value || 0), 0),
      potentialValue: opportunities
        .filter(o => !['fechado_ganhou', 'fechado_perdeu'].includes(o.stage))
        .reduce((sum, o) => sum + (o.estimated_value || 0), 0),
    };
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  return {
    opportunities,
    loading,
    createOpportunity,
    updateOpportunity,
    fetchOpportunities,
    getOpportunitiesByStage,
    getStageStats,
  };
};