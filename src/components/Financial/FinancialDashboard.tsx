import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, Calendar, Banknote, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const FinancialDashboard = () => {
  // Dashboard metrics queries
  const { data: receivablesSummary } = useQuery({
    queryKey: ['receivables-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('accounts_receivable')
        .select('amount_brl, status, due_date')
        .gte('due_date', new Date().toISOString().split('T')[0]);
      
      if (error) throw error;
      
      const total = data?.reduce((sum, item) => sum + Number(item.amount_brl), 0) || 0;
      const overdue = data?.filter(item => new Date(item.due_date) < new Date()).length || 0;
      
      return { total, count: data?.length || 0, overdue };
    }
  });

  const { data: payablesSummary } = useQuery({
    queryKey: ['payables-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('accounts_payable')
        .select('amount_brl, status, due_date')
        .gte('due_date', new Date().toISOString().split('T')[0]);
      
      if (error) throw error;
      
      const total = data?.reduce((sum, item) => sum + Number(item.amount_brl), 0) || 0;
      const overdue = data?.filter(item => new Date(item.due_date) < new Date()).length || 0;
      
      return { total, count: data?.length || 0, overdue };
    }
  });

  const { data: accSummary } = useQuery({
    queryKey: ['acc-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('acc_contracts')
        .select('amount_brl, status, maturity_date')
        .eq('status', 'aberto');
      
      if (error) throw error;
      
      const total = data?.reduce((sum, item) => sum + Number(item.amount_brl), 0) || 0;
      const nearMaturity = data?.filter(item => {
        const maturity = new Date(item.maturity_date);
        const today = new Date();
        const diffTime = maturity.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30;
      }).length || 0;
      
      return { total, count: data?.length || 0, nearMaturity };
    }
  });

  const { data: lcSummary } = useQuery({
    queryKey: ['lc-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('letter_of_credit')
        .select('amount, currency, status, expiry_date')
        .in('status', ['emitida', 'confirmada', 'embarcada']);
      
      if (error) throw error;
      
      const total = data?.reduce((sum, item) => {
        // Assumindo USD como padrão para LC
        const rate = 5.2; // Taxa exemplo
        return sum + (Number(item.amount) * rate);
      }, 0) || 0;
      
      const nearExpiry = data?.filter(item => {
        const expiry = new Date(item.expiry_date);
        const today = new Date();
        const diffTime = expiry.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 15;
      }).length || 0;
      
      return { total, count: data?.length || 0, nearExpiry };
    }
  });

  const { data: cashFlowSummary } = useQuery({
    queryKey: ['cash-flow-summary'],
    queryFn: async () => {
      const today = new Date();
      const next30Days = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
      
      const { data, error } = await supabase
        .from('cash_flow')
        .select('amount_brl, flow_type, status')
        .gte('flow_date', today.toISOString().split('T')[0])
        .lte('flow_date', next30Days.toISOString().split('T')[0]);
      
      if (error) throw error;
      
      const inflows = data?.filter(item => item.flow_type === 'entrada')
        .reduce((sum, item) => sum + Number(item.amount_brl), 0) || 0;
      
      const outflows = data?.filter(item => item.flow_type === 'saida')
        .reduce((sum, item) => sum + Number(item.amount_brl), 0) || 0;
      
      return { inflows, outflows, net: inflows - outflows };
    }
  });

  return (
    <div className="space-y-6">
      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Contas a Receber</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {(receivablesSummary?.total || 0).toLocaleString('pt-BR')}
                </p>
                <p className="text-xs text-gray-500">{receivablesSummary?.count || 0} faturas</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            {(receivablesSummary?.overdue || 0) > 0 && (
              <div className="mt-2">
                <Badge variant="destructive">{receivablesSummary?.overdue} em atraso</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Contas a Pagar</p>
                <p className="text-2xl font-bold text-red-600">
                  R$ {(payablesSummary?.total || 0).toLocaleString('pt-BR')}
                </p>
                <p className="text-xs text-gray-500">{payablesSummary?.count || 0} faturas</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
            {(payablesSummary?.overdue || 0) > 0 && (
              <div className="mt-2">
                <Badge variant="destructive">{payablesSummary?.overdue} vencidas</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ACC Abertos</p>
                <p className="text-2xl font-bold text-blue-600">
                  R$ {(accSummary?.total || 0).toLocaleString('pt-BR')}
                </p>
                <p className="text-xs text-gray-500">{accSummary?.count || 0} contratos</p>
              </div>
              <Banknote className="h-8 w-8 text-blue-600" />
            </div>
            {(accSummary?.nearMaturity || 0) > 0 && (
              <div className="mt-2">
                <Badge variant="secondary">{accSummary?.nearMaturity} vencem em 30 dias</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">LC Ativas</p>
                <p className="text-2xl font-bold text-purple-600">
                  R$ {(lcSummary?.total || 0).toLocaleString('pt-BR')}
                </p>
                <p className="text-xs text-gray-500">{lcSummary?.count || 0} cartas</p>
              </div>
              <CreditCard className="h-8 w-8 text-purple-600" />
            </div>
            {(lcSummary?.nearExpiry || 0) > 0 && (
              <div className="mt-2">
                <Badge variant="destructive">{lcSummary?.nearExpiry} vencem em 15 dias</Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Fluxo de Caixa Próximos 30 Dias */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Fluxo de Caixa - Próximos 30 Dias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-green-600">Entradas Previstas</span>
                  <span className="text-lg font-bold text-green-600">
                    R$ {(cashFlowSummary?.inflows || 0).toLocaleString('pt-BR')}
                  </span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-red-600">Saídas Previstas</span>
                  <span className="text-lg font-bold text-red-600">
                    R$ {(cashFlowSummary?.outflows || 0).toLocaleString('pt-BR')}
                  </span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
              
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Resultado Líquido</span>
                  <span className={`text-lg font-bold ${
                    (cashFlowSummary?.net || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    R$ {(cashFlowSummary?.net || 0).toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alertas e Notificações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Alertas Financeiros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(receivablesSummary?.overdue || 0) > 0 && (
                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-sm font-medium text-red-700">
                      {receivablesSummary?.overdue} faturas em atraso
                    </p>
                    <p className="text-xs text-red-600">Verificar recebíveis vencidos</p>
                  </div>
                </div>
              )}
              
              {(payablesSummary?.overdue || 0) > 0 && (
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium text-orange-700">
                      {payablesSummary?.overdue} contas vencidas
                    </p>
                    <p className="text-xs text-orange-600">Providenciar pagamentos</p>
                  </div>
                </div>
              )}
              
              {(accSummary?.nearMaturity || 0) > 0 && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Banknote className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-blue-700">
                      {accSummary?.nearMaturity} ACC próximos do vencimento
                    </p>
                    <p className="text-xs text-blue-600">Preparar liquidação</p>
                  </div>
                </div>
              )}
              
              {(lcSummary?.nearExpiry || 0) > 0 && (
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <CreditCard className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium text-purple-700">
                      {lcSummary?.nearExpiry} LC próximas do vencimento
                    </p>
                    <p className="text-xs text-purple-600">Verificar embarque urgente</p>
                  </div>
                </div>
              )}
              
              {!receivablesSummary?.overdue && !payablesSummary?.overdue && 
               !accSummary?.nearMaturity && !lcSummary?.nearExpiry && (
                <div className="text-center py-6">
                  <div className="text-green-600 mb-2">
                    <DollarSign className="h-8 w-8 mx-auto" />
                  </div>
                  <p className="text-sm text-gray-600">Nenhum alerta no momento</p>
                  <p className="text-xs text-gray-500">Situação financeira sob controle</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinancialDashboard;