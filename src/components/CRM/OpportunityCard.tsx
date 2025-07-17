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
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-sm font-medium line-clamp-2">
              {opportunity.title}
            </CardTitle>
            <Badge 
              variant="secondary" 
              className={STAGE_COLORS[opportunity.stage as keyof typeof STAGE_COLORS]}
            >
              {STAGE_LABELS[opportunity.stage as keyof typeof STAGE_LABELS]}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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
      
      <CardContent className="space-y-3">
        {opportunity.contact && (
          <div className="flex items-center text-sm text-muted-foreground">
            <User className="h-4 w-4 mr-2" />
            <span className="truncate">{opportunity.contact.company_name}</span>
          </div>
        )}
        
        {opportunity.estimated_value && (
          <div className="flex items-center text-sm">
            <DollarSign className="h-4 w-4 mr-2 text-green-600" />
            <span className="font-medium text-green-600">
              {formatCurrency(opportunity.estimated_value)}
            </span>
          </div>
        )}
        
        {opportunity.probability && (
          <div className="flex items-center text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4 mr-2" />
            <span>{opportunity.probability}% de probabilidade</span>
          </div>
        )}
        
        {opportunity.expected_close_date && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            <span>
              {format(new Date(opportunity.expected_close_date), 'dd/MM/yyyy', { locale: ptBR })}
            </span>
          </div>
        )}
        
        {opportunity.assigned_to_profile && (
          <div className="flex items-center text-xs text-muted-foreground">
            <User className="h-3 w-3 mr-1" />
            <span>Responsável: {opportunity.assigned_to_profile.name}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};