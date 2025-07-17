import React, { useState } from 'react';
import { Plus, Filter, TrendingUp, DollarSign, Target, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCrmOpportunities } from '@/hooks/useCrmOpportunities';
import { OpportunityCard } from './OpportunityCard';
import { NewOpportunityModal } from './NewOpportunityModal';
import type { Database } from '@/integrations/supabase/types';

type CrmOpportunity = Database['public']['Tables']['crm_opportunities']['Row'];

const STAGE_CONFIG = {
  contato_inicial: {
    title: 'Contato Inicial',
    color: 'bg-gradient-to-br from-slate-50 to-slate-100 text-slate-700 border-slate-300 shadow-sm',
    icon: Users,
  },
  qualificado: {
    title: 'Qualificado',
    color: 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 border-blue-300 shadow-sm',
    icon: Filter,
  },
  proposta_enviada: {
    title: 'Proposta Enviada',
    color: 'bg-gradient-to-br from-yellow-50 to-yellow-100 text-yellow-700 border-yellow-300 shadow-sm',
    icon: Target,
  },
  negociacao: {
    title: 'Negociação',
    color: 'bg-gradient-to-br from-orange-50 to-orange-100 text-orange-700 border-orange-300 shadow-sm',
    icon: TrendingUp,
  },
  fechado_ganhou: {
    title: 'Fechado (Ganhou)',
    color: 'bg-gradient-to-br from-green-50 to-green-100 text-green-700 border-green-300 shadow-sm',
    icon: DollarSign,
  },
  fechado_perdeu: {
    title: 'Fechado (Perdeu)',
    color: 'bg-gradient-to-br from-red-50 to-red-100 text-red-700 border-red-300 shadow-sm',
    icon: Users,
  },
};

const CrmSalesFunnel: React.FC = () => {
  const [showNewOpportunity, setShowNewOpportunity] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<CrmOpportunity | null>(null);
  const [filterAssignedTo, setFilterAssignedTo] = useState('all');
  
  const {
    opportunities,
    loading,
    updateOpportunity,
    getOpportunitiesByStage,
    getStageStats,
  } = useCrmOpportunities();

  const opportunitiesByStage = getOpportunitiesByStage();
  const stats = getStageStats();

  const handleStageChange = async (opportunityId: string, newStage: string) => {
    try {
      const updates: any = { stage: newStage };
      
      if (newStage === 'fechado_ganhou' || newStage === 'fechado_perdeu') {
        updates.actual_close_date = new Date().toISOString().split('T')[0];
      }
      
      await updateOpportunity(opportunityId, updates);
    } catch (error) {
      console.error('Erro ao atualizar estágio:', error);
    }
  };

  const handleEditOpportunity = (opportunity: CrmOpportunity) => {
    setEditingOpportunity(opportunity);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Carregando funil de vendas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-slate-50 to-white min-h-screen">
      {/* Header com estatísticas */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Funil de Vendas</h1>
          <p className="text-slate-600 text-lg">
            Gerencie suas oportunidades de venda com eficiência
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={filterAssignedTo} onValueChange={setFilterAssignedTo}>
            <SelectTrigger className="w-56 bg-white shadow-sm border-slate-200">
              <SelectValue placeholder="Filtrar por responsável" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os responsáveis</SelectItem>
              {/* TODO: Add users list */}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={() => setShowNewOpportunity(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Oportunidade
          </Button>
        </div>
      </div>

      {/* Estatísticas gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-white to-slate-50 border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-slate-700">Oportunidades Ativas</CardTitle>
            <div className="p-2 bg-blue-100 rounded-full">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{stats.active}</div>
            <p className="text-sm text-slate-500 mt-1">
              {stats.total} no total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-green-700">Fechadas (Ganhou)</CardTitle>
            <div className="p-2 bg-green-100 rounded-full">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">{stats.won}</div>
            <p className="text-sm text-green-600 mt-1">
              Taxa: {stats.total > 0 ? Math.round((stats.won / stats.total) * 100) : 0}%
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-emerald-700">Valor Realizado</CardTitle>
            <div className="p-2 bg-emerald-100 rounded-full">
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">
              {formatCurrency(stats.totalValue)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-blue-700">Potencial</CardTitle>
            <div className="p-2 bg-blue-100 rounded-full">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {formatCurrency(stats.potentialValue)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funil de vendas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {Object.entries(STAGE_CONFIG).map(([stageKey, config]) => {
          const stageOpportunities = opportunitiesByStage[stageKey as keyof typeof opportunitiesByStage] || [];
          const IconComponent = config.icon;
          
          return (
            <div key={stageKey} className="space-y-4">
              <div className={`rounded-xl border-2 p-4 ${config.color} hover:scale-105 transition-all duration-200`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-sm">{config.title}</h3>
                  </div>
                  <Badge variant="secondary" className="bg-white/80 text-slate-700 font-semibold px-3 py-1">
                    {stageOpportunities.length}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-4 min-h-[300px]">
                {stageOpportunities.map((opportunity) => (
                  <OpportunityCard
                    key={opportunity.id}
                    opportunity={opportunity}
                    onEdit={handleEditOpportunity}
                    onStageChange={handleStageChange}
                  />
                ))}
                
                {stageOpportunities.length === 0 && (
                  <div className="bg-white/50 rounded-xl border-2 border-dashed border-slate-200 p-8">
                    <div className="text-center text-slate-400">
                      <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm font-medium">Nenhuma oportunidade</p>
                      <p className="text-xs mt-1">Arraste oportunidades para esta coluna</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modais */}
      <NewOpportunityModal
        isOpen={showNewOpportunity}
        onClose={() => setShowNewOpportunity(false)}
      />
      
      {editingOpportunity && (
        <NewOpportunityModal
          isOpen={true}
          onClose={() => setEditingOpportunity(null)}
          opportunity={editingOpportunity}
        />
      )}
    </div>
  );
};

export default CrmSalesFunnel;