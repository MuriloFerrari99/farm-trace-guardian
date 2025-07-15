import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Plus, Download, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const CashFlow = () => {
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterOrigin, setFilterOrigin] = useState('all');

  const { data: cashFlowData } = useQuery({
    queryKey: ['cash-flow', filterType, filterOrigin],
    queryFn: async () => {
      let query = supabase
        .from('cash_flow')
        .select('*')
        .order('flow_date', { ascending: false });

      if (filterType && filterType !== 'all' && (filterType === 'entrada' || filterType === 'saida')) {
        query = query.eq('flow_type', filterType as 'entrada' | 'saida');
      }
      if (filterOrigin && filterOrigin !== 'all' && ['vendas', 'acc', 'lc', 'emprestimo', 'capital', 'outros'].includes(filterOrigin)) {
        query = query.eq('origin', filterOrigin as 'vendas' | 'acc' | 'lc' | 'emprestimo' | 'capital' | 'outros');
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const getFlowTypeBadge = (type: string) => {
    return type === 'entrada' ? (
      <Badge className="bg-green-100 text-green-800">Entrada</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">Saída</Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      previsto: { label: 'Previsto', variant: 'secondary' as const },
      realizado: { label: 'Realizado', variant: 'default' as const },
      cancelado: { label: 'Cancelado', variant: 'destructive' as const }
    };
    const config = statusMap[status as keyof typeof statusMap] || statusMap.previsto;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const totalInflows = cashFlowData?.filter(item => item.flow_type === 'entrada')
    .reduce((sum, item) => sum + Number(item.amount_brl), 0) || 0;

  const totalOutflows = cashFlowData?.filter(item => item.flow_type === 'saida')
    .reduce((sum, item) => sum + Number(item.amount_brl), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Entradas</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {totalInflows.toLocaleString('pt-BR')}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Saídas</p>
                <p className="text-2xl font-bold text-red-600">
                  R$ {totalOutflows.toLocaleString('pt-BR')}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resultado Líquido</p>
                <p className={`text-2xl font-bold ${
                  (totalInflows - totalOutflows) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  R$ {(totalInflows - totalOutflows).toLocaleString('pt-BR')}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Ações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Fluxo de Caixa</span>
            <div className="flex gap-2">
              <Dialog open={showNewEntry} onOpenChange={setShowNewEntry}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Entrada
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Nova Movimentação de Caixa</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="entrada">Entrada</SelectItem>
                          <SelectItem value="saida">Saída</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Origem</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a origem" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vendas">Vendas</SelectItem>
                          <SelectItem value="acc">ACC</SelectItem>
                          <SelectItem value="lc">Carta de Crédito</SelectItem>
                          <SelectItem value="emprestimo">Empréstimo</SelectItem>
                          <SelectItem value="capital">Capital</SelectItem>
                          <SelectItem value="outros">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Valor</Label>
                      <Input type="number" placeholder="0,00" />
                    </div>
                    <div className="space-y-2">
                      <Label>Descrição</Label>
                      <Textarea placeholder="Descrição da movimentação..." />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button onClick={() => setShowNewEntry(false)} variant="outline" className="flex-1">
                        Cancelar
                      </Button>
                      <Button className="flex-1">Salvar</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <Label className="text-sm font-medium mb-2 block">Tipo de Fluxo</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="saida">Saída</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Origem</Label>
              <Select value={filterOrigin} onValueChange={setFilterOrigin}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as origens" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as origens</SelectItem>
                  <SelectItem value="vendas">Vendas</SelectItem>
                  <SelectItem value="acc">ACC</SelectItem>
                  <SelectItem value="lc">Carta de Crédito</SelectItem>
                  <SelectItem value="emprestimo">Empréstimo</SelectItem>
                  <SelectItem value="capital">Capital</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cashFlowData?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {new Date(item.flow_date).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>{getFlowTypeBadge(item.flow_type)}</TableCell>
                  <TableCell className="capitalize">{item.origin}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className={`font-medium ${
                    item.flow_type === 'entrada' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {item.flow_type === 'entrada' ? '+' : '-'} R$ {Number(item.amount_brl).toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CashFlow;