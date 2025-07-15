import React from 'react';
import { Users, Phone, Target, TrendingUp, CheckCircle, Clock, AlertCircle, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const CrmDashboard = () => {
  // Fetch CRM stats
  const { data: stats } = useQuery({
    queryKey: ['crm-stats'],
    queryFn: async () => {
      const { data: contacts } = await supabase
        .from('crm_contacts')
        .select('id, status');

      const { data: opportunities } = await supabase
        .from('crm_opportunities')
        .select('id, stage, estimated_value');

      const { data: interactions } = await supabase
        .from('crm_interactions')
        .select('id, next_action_date')
        .not('next_action_date', 'is', null);

      const totalContacts = contacts?.length || 0;
      const activeContacts = contacts?.filter(c => c.status === 'ativo').length || 0;
      const totalOpportunities = opportunities?.length || 0;
      const wonOpportunities = opportunities?.filter(o => o.stage === 'fechado_ganhou').length || 0;
      const totalValue = opportunities?.reduce((sum, o) => sum + (o.estimated_value || 0), 0) || 0;
      const pendingActions = interactions?.filter(i => new Date(i.next_action_date) >= new Date()).length || 0;

      return {
        totalContacts,
        activeContacts,
        totalOpportunities,
        wonOpportunities,
        totalValue,
        pendingActions,
        conversionRate: totalOpportunities > 0 ? (wonOpportunities / totalOpportunities * 100).toFixed(1) : '0',
        averageTicket: wonOpportunities > 0 ? (totalValue / wonOpportunities).toFixed(2) : '0'
      };
    }
  });

  const statsCards = [
    {
      title: 'Total de Contatos',
      value: stats?.totalContacts || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Contatos Ativos',
      value: stats?.activeContacts || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Oportunidades',
      value: stats?.totalOpportunities || 0,
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Taxa de Conversão',
      value: `${stats?.conversionRate || 0}%`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Valor Total Pipeline',
      value: `R$ ${(stats?.totalValue || 0).toLocaleString('pt-BR')}`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Ticket Médio',
      value: `R$ ${stats?.averageTicket || 0}`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Ações Pendentes',
      value: stats?.pendingActions || 0,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Follow-ups Hoje',
      value: 0, // Will be calculated based on today's date
      icon: Calendar,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Ações Prioritárias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="font-medium text-red-900">Follow-ups atrasados</p>
                  <p className="text-sm text-red-600">3 contatos precisam de atenção</p>
                </div>
                <Clock className="h-5 w-5 text-red-500" />
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div>
                  <p className="font-medium text-yellow-900">Propostas sem resposta</p>
                  <p className="text-sm text-yellow-600">5 propostas enviadas há mais de 7 dias</p>
                </div>
                <Target className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-blue-900">Novos contatos para qualificar</p>
                  <p className="text-sm text-blue-600">8 contatos aguardando primeira abordagem</p>
                </div>
                <Users className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pipeline por Estágio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { stage: 'Contato Inicial', count: 12, value: 'R$ 45.000', color: 'bg-gray-200' },
                { stage: 'Qualificado', count: 8, value: 'R$ 78.000', color: 'bg-blue-200' },
                { stage: 'Proposta Enviada', count: 5, value: 'R$ 125.000', color: 'bg-yellow-200' },
                { stage: 'Negociação', count: 3, value: 'R$ 89.000', color: 'bg-orange-200' },
                { stage: 'Fechado', count: 2, value: 'R$ 67.000', color: 'bg-green-200' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded ${item.color}`} />
                    <span className="font-medium">{item.stage}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{item.count} oportunidades</p>
                    <p className="text-sm text-gray-600">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CrmDashboard;