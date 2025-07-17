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
    color: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: Users,
  },
  qualificado: {
    title: 'Qualificado',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: Filter,
  },
  proposta_enviada: {
    title: 'Proposta Enviada',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: Target,
  },
  negociacao: {
    title: 'Negociação',
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    icon: TrendingUp,
  },
  fechado_ganhou: {
    title: 'Fechado (Ganhou)',
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: DollarSign,
  },
  fechado_perdeu: {
    title: 'Fechado (Perdeu)',
    color: 'bg-red-100 text-red-700 border-red-200',
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
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Funil de Vendas</h2>
          <p className="text-muted-foreground">
            Gerencie suas oportunidades de venda
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={filterAssignedTo} onValueChange={setFilterAssignedTo}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por responsável" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os responsáveis</SelectItem>
              {/* TODO: Add users list */}
            </SelectContent>
          </Select>
          
          <Button onClick={() => setShowNewOpportunity(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Oportunidade
          </Button>
        </div>
      </div>

      {/* Estatísticas gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Oportunidades Ativas</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total} no total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fechadas (Ganhou)</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.won}</div>
            <p className="text-xs text-muted-foreground">
              Taxa: {stats.total > 0 ? Math.round((stats.won / stats.total) * 100) : 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Realizado</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalValue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potencial</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(stats.potentialValue)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funil de vendas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Object.entries(STAGE_CONFIG).map(([stageKey, config]) => {
          const stageOpportunities = opportunitiesByStage[stageKey as keyof typeof opportunitiesByStage] || [];
          const IconComponent = config.icon;
          
          return (
            <div key={stageKey} className="space-y-3">
              <div className={`rounded-lg border-2 border-dashed p-3 ${config.color}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-4 w-4" />
                    <h3 className="font-semibold text-sm">{config.title}</h3>
                  </div>
                  <Badge variant="secondary" className="bg-white/50">
                    {stageOpportunities.length}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-3 min-h-[200px]">
                {stageOpportunities.map((opportunity) => (
                  <OpportunityCard
                    key={opportunity.id}
                    opportunity={opportunity}
                    onEdit={handleEditOpportunity}
                    onStageChange={handleStageChange}
                  />
                ))}
                
                {stageOpportunities.length === 0 && (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    Nenhuma oportunidade
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