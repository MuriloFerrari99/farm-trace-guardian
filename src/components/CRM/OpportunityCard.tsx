import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  User, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  Edit,
  MoreHorizontal
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Database } from '@/integrations/supabase/types';

type CrmOpportunity = Database['public']['Tables']['crm_opportunities']['Row'];

interface OpportunityCardProps {
  opportunity: CrmOpportunity & {
    contact?: any;
    assigned_to_profile?: any;
  };
  onEdit: (opportunity: CrmOpportunity) => void;
  onStageChange: (id: string, stage: string) => void;
}

const STAGE_LABELS = {
  contato_inicial: 'Contato Inicial',
  qualificado: 'Qualificado',
  proposta_enviada: 'Proposta Enviada',
  negociacao: 'Negociação',
  fechado_ganhou: 'Fechado (Ganhou)',
  fechado_perdeu: 'Fechado (Perdeu)',
};

const STAGE_COLORS = {
  contato_inicial: 'bg-slate-100 text-slate-700',
  qualificado: 'bg-blue-100 text-blue-700',
  proposta_enviada: 'bg-yellow-100 text-yellow-700',
  negociacao: 'bg-orange-100 text-orange-700',
  fechado_ganhou: 'bg-green-100 text-green-700',
  fechado_perdeu: 'bg-red-100 text-red-700',
};

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  onEdit,
  onStageChange,
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: opportunity.currency || 'BRL',
    }).format(value);
  };

  const getNextStages = () => {
    const stages = Object.keys(STAGE_LABELS);
    const currentIndex = stages.indexOf(opportunity.stage);
    
    if (currentIndex === -1) return [];
    
    // Se já está fechado, não pode mudar para outro estágio
    if (['fechado_ganhou', 'fechado_perdeu'].includes(opportunity.stage)) {
      return [];
    }
    
    // Pode avançar para próximos estágios ou marcar como perdido
    const nextStages = stages.slice(currentIndex + 1);
    if (!nextStages.includes('fechado_perdeu')) {
      nextStages.push('fechado_perdeu');
    }
    
    return nextStages;
  };

  return (
    <Card className="bg-gradient-to-br from-white to-slate-50 hover:shadow-xl hover:scale-105 transition-all duration-300 border-slate-200 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <CardTitle className="text-sm font-semibold line-clamp-2 text-slate-800 group-hover:text-slate-900">
              {opportunity.title}
            </CardTitle>
            <Badge 
              variant="secondary" 
              className={`${STAGE_COLORS[opportunity.stage as keyof typeof STAGE_COLORS]} font-medium shadow-sm`}
            >
              {STAGE_LABELS[opportunity.stage as keyof typeof STAGE_LABELS]}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="opacity-60 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white shadow-lg border-slate-200">
              <DropdownMenuItem onClick={() => onEdit(opportunity)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              {getNextStages().map(stage => (
                <DropdownMenuItem 
                  key={stage}
                  onClick={() => onStageChange(opportunity.id, stage)}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Mover para {STAGE_LABELS[stage as keyof typeof STAGE_LABELS]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {opportunity.contact && (
          <div className="flex items-center text-sm text-slate-600 bg-slate-50 rounded-lg p-2">
            <User className="h-4 w-4 mr-2 text-slate-500" />
            <span className="truncate font-medium">{opportunity.contact.company_name}</span>
          </div>
        )}
        
        {opportunity.estimated_value && (
          <div className="flex items-center justify-between text-sm bg-green-50 rounded-lg p-2">
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-green-600" />
              <span className="text-slate-600">Valor estimado</span>
            </div>
            <span className="font-bold text-green-700">
              {formatCurrency(opportunity.estimated_value)}
            </span>
          </div>
        )}
        
        {opportunity.probability && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                <span>Probabilidade</span>
              </div>
              <span className="font-semibold">{opportunity.probability}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${opportunity.probability}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {opportunity.expected_close_date && (
          <div className="flex items-center text-sm text-slate-600 bg-blue-50 rounded-lg p-2">
            <Calendar className="h-4 w-4 mr-2 text-blue-600" />
            <span>
              Fechamento: {format(new Date(opportunity.expected_close_date), 'dd/MM/yyyy', { locale: ptBR })}
            </span>
          </div>
        )}
        
        {opportunity.assigned_to_profile && (
          <div className="flex items-center text-xs text-slate-500 border-t pt-3">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mr-2">
              <span className="text-white font-semibold text-xs">
                {opportunity.assigned_to_profile.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span>{opportunity.assigned_to_profile.name}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};