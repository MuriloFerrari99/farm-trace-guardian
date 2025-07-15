import React, { useState } from 'react';
import { FileText, Download, TrendingUp, BarChart3, DollarSign, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const FinancialReports = () => {
  const [reportPeriod, setReportPeriod] = useState('monthly');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  // DRE - Demonstrativo de Resultados
  const { data: dreData } = useQuery({
    queryKey: ['dre-report', reportPeriod, selectedYear],
    queryFn: async () => {
      const startDate = `${selectedYear}-01-01`;
      const endDate = `${selectedYear}-12-31`;

      const { data: transactions, error } = await supabase
        .from('financial_transactions')
        .select(`
          *,
          chart_of_accounts(account_type, account_name, cost_center)
        `)
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate);

      if (error) throw error;

      // Agrupar por tipo de conta
      const grouped = transactions?.reduce((acc, transaction) => {
        const accountType = transaction.chart_of_accounts?.account_type;
        const costCenter = transaction.chart_of_accounts?.cost_center;
        
        if (!acc[accountType]) acc[accountType] = {};
        if (!acc[accountType][costCenter]) acc[accountType][costCenter] = 0;
        
        acc[accountType][costCenter] += Number(transaction.amount_brl);
        return acc;
      }, {} as any) || {};

      return grouped;
    }
  });

  // Resumo Financeiro
  const { data: financialSummary } = useQuery({
    queryKey: ['financial-summary'],
    queryFn: async () => {
      const today = new Date();
      const currentMonth = today.toISOString().slice(0, 7); // YYYY-MM

      const [receivables, payables, cashFlow, accContracts] = await Promise.all([
        supabase.from('accounts_receivable').select('amount_brl, status'),
        supabase.from('accounts_payable').select('amount_brl, status'),
        supabase.from('cash_flow').select('amount_brl, flow_type, status').gte('flow_date', `${currentMonth}-01`),
        supabase.from('acc_contracts').select('amount_brl, status')
      ]);

      const totalReceivable = receivables.data?.reduce((sum, item) => sum + Number(item.amount_brl), 0) || 0;
      const totalPayable = payables.data?.reduce((sum, item) => sum + Number(item.amount_brl), 0) || 0;
      const monthlyInflow = cashFlow.data?.filter(item => item.flow_type === 'entrada')
        .reduce((sum, item) => sum + Number(item.amount_brl), 0) || 0;
      const monthlyOutflow = cashFlow.data?.filter(item => item.flow_type === 'saida')
        .reduce((sum, item) => sum + Number(item.amount_brl), 0) || 0;
      const totalAcc = accContracts.data?.filter(item => item.status === 'aberto')
        .reduce((sum, item) => sum + Number(item.amount_brl), 0) || 0;

      return {
        totalReceivable,
        totalPayable,
        monthlyInflow,
        monthlyOutflow,
        netCashFlow: monthlyInflow - monthlyOutflow,
        totalAcc
      };
    }
  });

  // Relatório de Operações de Câmbio
  const { data: exchangeOperations } = useQuery({
    queryKey: ['exchange-operations'],
    queryFn: async () => {
      const [accData, lcData] = await Promise.all([
        supabase.from('acc_contracts').select('*').order('contract_date', { ascending: false }),
        supabase.from('letter_of_credit').select('*').order('issue_date', { ascending: false })
      ]);

      return {
        accContracts: accData.data || [],
        letterOfCredits: lcData.data || []
      };
    }
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Controles de Relatório */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Relatórios Financeiros</span>
            <div className="flex gap-2">
              <Select value={reportPeriod} onValueChange={setReportPeriod}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="quarterly">Trimestral</SelectItem>
                  <SelectItem value="yearly">Anual</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                </SelectContent>
              </Select>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs defaultValue="summary" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="summary">Resumo Geral</TabsTrigger>
          <TabsTrigger value="dre">DRE</TabsTrigger>
          <TabsTrigger value="exchange">Operações Câmbio</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <div className="space-y-6">
            {/* Métricas Principais */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Fluxo de Caixa Mensal</p>
                      <p className={`text-2xl font-bold ${
                        (financialSummary?.netCashFlow || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(financialSummary?.netCashFlow || 0)}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total a Receber</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(financialSummary?.totalReceivable || 0)}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">ACC Abertos</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {formatCurrency(financialSummary?.totalAcc || 0)}
                      </p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Resumo por Centro de Custo */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo por Centro de Custo</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Centro de Custo</TableHead>
                      <TableHead>Receitas</TableHead>
                      <TableHead>Custos</TableHead>
                      <TableHead>Despesas</TableHead>
                      <TableHead>Resultado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {['producao', 'comercial', 'administrativo', 'financeiro', 'exportacao'].map((center) => (
                      <TableRow key={center}>
                        <TableCell className="font-medium capitalize">{center.replace('_', ' ')}</TableCell>
                        <TableCell className="text-green-600">
                          {formatCurrency(dreData?.receita?.[center] || 0)}
                        </TableCell>
                        <TableCell className="text-orange-600">
                          {formatCurrency(dreData?.custo?.[center] || 0)}
                        </TableCell>
                        <TableCell className="text-red-600">
                          {formatCurrency(dreData?.despesa?.[center] || 0)}
                        </TableCell>
                        <TableCell className={`font-medium ${
                          ((dreData?.receita?.[center] || 0) - (dreData?.custo?.[center] || 0) - (dreData?.despesa?.[center] || 0)) >= 0 
                            ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(
                            (dreData?.receita?.[center] || 0) - 
                            (dreData?.custo?.[center] || 0) - 
                            (dreData?.despesa?.[center] || 0)
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="dre">
          <Card>
            <CardHeader>
              <CardTitle>Demonstrativo de Resultados (DRE)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 font-semibold border-b pb-2">
                  <div>Conta</div>
                  <div className="text-right">Valor</div>
                  <div className="text-right">%</div>
                </div>

                {/* Receitas */}
                <div className="space-y-2">
                  <div className="font-semibold text-green-600">RECEITAS</div>
                  {Object.entries(dreData?.receita || {}).map(([center, value]) => (
                    <div key={center} className="grid grid-cols-3 gap-4 pl-4">
                      <div className="capitalize">{center.replace('_', ' ')}</div>
                      <div className="text-right">{formatCurrency(Number(value))}</div>
                      <div className="text-right">-</div>
                    </div>
                  ))}
                </div>

                {/* Custos */}
                <div className="space-y-2">
                  <div className="font-semibold text-orange-600">CUSTOS</div>
                  {Object.entries(dreData?.custo || {}).map(([center, value]) => (
                    <div key={center} className="grid grid-cols-3 gap-4 pl-4">
                      <div className="capitalize">{center.replace('_', ' ')}</div>
                      <div className="text-right">({formatCurrency(Number(value))})</div>
                      <div className="text-right">-</div>
                    </div>
                  ))}
                </div>

                {/* Despesas */}
                <div className="space-y-2">
                  <div className="font-semibold text-red-600">DESPESAS</div>
                  {Object.entries(dreData?.despesa || {}).map(([center, value]) => (
                    <div key={center} className="grid grid-cols-3 gap-4 pl-4">
                      <div className="capitalize">{center.replace('_', ' ')}</div>
                      <div className="text-right">({formatCurrency(Number(value))})</div>
                      <div className="text-right">-</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exchange">
          <div className="space-y-6">
            {/* Contratos ACC */}
            <Card>
              <CardHeader>
                <CardTitle>Contratos ACC</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contrato</TableHead>
                      <TableHead>Banco</TableHead>
                      <TableHead>Valor USD</TableHead>
                      <TableHead>Taxa</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exchangeOperations?.accContracts.slice(0, 5).map((contract) => (
                      <TableRow key={contract.id}>
                        <TableCell className="font-medium">{contract.contract_number}</TableCell>
                        <TableCell>{contract.bank_name}</TableCell>
                        <TableCell>USD {Number(contract.amount_usd).toLocaleString()}</TableCell>
                        <TableCell>{Number(contract.exchange_rate).toFixed(4)}</TableCell>
                        <TableCell>{new Date(contract.maturity_date).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>
                          <Badge variant={contract.status === 'aberto' ? 'default' : 'secondary'}>
                            {contract.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Cartas de Crédito */}
            <Card>
              <CardHeader>
                <CardTitle>Cartas de Crédito</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>LC</TableHead>
                      <TableHead>Banco Emissor</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Emissão</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exchangeOperations?.letterOfCredits.slice(0, 5).map((lc) => (
                      <TableRow key={lc.id}>
                        <TableCell className="font-medium">{lc.lc_number}</TableCell>
                        <TableCell>{lc.issuing_bank}</TableCell>
                        <TableCell>{lc.currency} {Number(lc.amount).toLocaleString()}</TableCell>
                        <TableCell>{new Date(lc.issue_date).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>{new Date(lc.expiry_date).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>
                          <Badge variant={lc.status === 'liberada' ? 'default' : 'secondary'}>
                            {lc.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle>Controle de Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Lastro Financeiro</p>
                          <p className="text-lg font-bold text-green-600">100%</p>
                        </div>
                        <Calendar className="h-6 w-6 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Documentos Pendentes</p>
                          <p className="text-lg font-bold text-orange-600">3</p>
                        </div>
                        <FileText className="h-6 w-6 text-orange-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Auditoria</p>
                          <p className="text-lg font-bold text-blue-600">Em dia</p>
                        </div>
                        <BarChart3 className="h-6 w-6 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="text-center py-8">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Relatórios de Compliance</h3>
                  <p className="text-gray-600 mb-4">
                    Controle de lastro financeiro, documentação e auditoria
                  </p>
                  <Button>
                    <Download className="h-4 w-4 mr-2" />
                    Gerar Relatório Completo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialReports;