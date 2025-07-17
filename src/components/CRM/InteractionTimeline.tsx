import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, MessageSquare, Calendar, Users, MapPin, Clock, ArrowRight } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface InteractionTimelineProps {
  interactions: any[];
  isLoading?: boolean;
}

const InteractionTimeline = ({ interactions, isLoading }: InteractionTimelineProps) => {
  const getInteractionIcon = (type: string) => {
    const iconMap = {
      ligacao: Phone,
      reuniao: Users,
      email: Mail,
      whatsapp: MessageSquare,
      visita: MapPin,
      outros: Calendar
    };
    const IconComponent = iconMap[type as keyof typeof iconMap] || Calendar;
    return <IconComponent className="h-4 w-4" />;
  };

  const getInteractionTypeLabel = (type: string) => {
    const typeMap = {
      ligacao: 'Ligação',
      reuniao: 'Reunião',
      email: 'E-mail',
      whatsapp: 'WhatsApp',
      visita: 'Visita',
      outros: 'Outros'
    };
    return typeMap[type as keyof typeof typeMap] || type;
  };

  const getResultBadge = (result: string) => {
    if (!result) return null;

    const resultMap = {
      sucesso: { label: 'Sucesso', variant: 'default' as const },
      follow_up: { label: 'Follow-up', variant: 'secondary' as const },
      sem_interesse: { label: 'Sem Interesse', variant: 'destructive' as const },
      proposta_enviada: { label: 'Proposta Enviada', variant: 'default' as const },
      agendamento: { label: 'Agendamento', variant: 'secondary' as const },
      outros: { label: 'Outros', variant: 'outline' as const }
    };

    const config = resultMap[result as keyof typeof resultMap];
    if (!config) return null;

    return <Badge variant={config.variant} className="text-xs">{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!interactions || interactions.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500 mb-2">Nenhuma interação registrada ainda.</p>
        <p className="text-sm text-gray-400">
          Registre ligações, reuniões e outras atividades para acompanhar o relacionamento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {interactions.map((interaction, index) => (
        <Card key={interaction.id} className="relative">
          <CardContent className="p-4">
            {/* Timeline connector */}
            {index < interactions.length - 1 && (
              <div className="absolute left-6 top-12 w-0.5 h-6 bg-gray-200"></div>
            )}
            
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                {getInteractionIcon(interaction.interaction_type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {getInteractionTypeLabel(interaction.interaction_type)}
                      </span>
                      {getResultBadge(interaction.result)}
                    </div>
                    
                    <p className="text-gray-700 text-sm mb-2 leading-relaxed">
                      {interaction.feedback}
                    </p>

                    {interaction.next_action_date && interaction.next_action_description && (
                      <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                        <ArrowRight className="h-3 w-3" />
                        <span>
                          Próxima ação: {interaction.next_action_description} em{' '}
                          {format(new Date(interaction.next_action_date), 'dd/MM/yyyy', { locale: ptBR })}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-right text-xs text-gray-500 ml-4">
                    <div className="flex items-center gap-1 mb-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(interaction.interaction_date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </div>
                    <div className="text-gray-400">
                      {formatDistanceToNow(new Date(interaction.interaction_date), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </div>
                    {interaction.created_by_profile?.name && (
                      <div className="text-gray-400 mt-1">
                        por {interaction.created_by_profile.name}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default InteractionTimeline;