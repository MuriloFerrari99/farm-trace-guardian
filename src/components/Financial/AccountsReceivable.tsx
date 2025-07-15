import React, { useState } from 'react';
import { FileText, Plus, Download, Search, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const AccountsReceivable = () => {
  const [showNewReceivable, setShowNewReceivable] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: receivables } = useQuery({
    queryKey: ['accounts-receivable', searchTerm, filterStatus],
    queryFn: async () => {
      let query = supabase
        .from('accounts_receivable')
        .select('*')
        .order('due_date', { ascending: true });

      if (filterStatus && filterStatus !== 'all' && ['previsto', 'realizado', 'cancelado'].includes(filterStatus)) {
        query = query.eq('status', filterStatus as 'previsto' | 'realizado' | 'cancelado');
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return data?.filter(item => 
        searchTerm === '' || 
        item.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.invoice_number.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  });

  const getStatusBadge = (status: string) => {
    const statusMap = {
      previsto: { label: 'A Receber', variant: 'secondary' as const },
      realizado: { label: 'Recebido', variant: 'default' as const },
      cancelado: { label: 'Cancelado', variant: 'destructive' as const }
    };
    const config = statusMap[status as keyof typeof statusMap] || statusMap.previsto;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const totalAmount = receivables?.reduce((sum, item) => sum + Number(item.amount_brl), 0) || 0;
  const overdueAmount = receivables?.filter(item => isOverdue(item.due_date) && item.status === 'previsto')
    .reduce((sum, item) => sum + Number(item.amount_brl), 0) || 0;
  const receivedAmount = receivables?.filter(item => item.status === 'realizado')
    .reduce((sum, item) => sum + Number(item.amount_paid || item.amount_brl), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total a Receber</p>
                <p className="text-2xl font-bold text-blue-600">
                  R$ {totalAmount.toLocaleString('pt-BR')}
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Em Atraso</p>
                <p className="text-2xl font-bold text-red-600">
                  R$ {overdueAmount.toLocaleString('pt-BR')}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Já Recebido</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {receivedAmount.toLocaleString('pt-BR')}
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
                <p className="text-sm font-medium text-gray-600">Total de Faturas</p>
                <p className="text-2xl font-bold text-purple-600">
                  {receivables?.length || 0}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Contas a Receber */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Contas a Receber</span>
            <div className="flex gap-2">
              <Dialog open={showNewReceivable} onOpenChange={setShowNewReceivable}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Fatura
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Nova Conta a Receber</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Número da Fatura</Label>
                      <Input placeholder="Ex: INV-2024-001" />
                    </div>
                    <div className="space-y-2">
                      <Label>Cliente</Label>
                      <Input placeholder="Nome do cliente" />
                    </div>
                    <div className="space-y-2">
                      <Label>Valor</Label>
                      <Input type="number" placeholder="0,00" />
                    </div>
                    <div className="space-y-2">
                      <Label>Data de Vencimento</Label>
                      <Input type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label>Moeda</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a moeda" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BRL">Real (BRL)</SelectItem>
                          <SelectItem value="USD">Dólar (USD)</SelectItem>
                          <SelectItem value="EUR">Euro (EUR)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button onClick={() => setShowNewReceivable(false)} variant="outline" className="flex-1">
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
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por cliente ou fatura..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="previsto">A Receber</SelectItem>
                  <SelectItem value="realizado">Recebido</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button variant="outline" className="w-full">
                Gerar Boletos
              </Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fatura</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Data Emissão</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receivables?.map((receivable) => (
                <TableRow 
                  key={receivable.id}
                  className={isOverdue(receivable.due_date) && receivable.status === 'previsto' ? 'bg-red-50' : ''}
                >
                  <TableCell className="font-medium">{receivable.invoice_number}</TableCell>
                  <TableCell>{receivable.client_name}</TableCell>
                  <TableCell>
                    {new Date(receivable.issue_date).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {new Date(receivable.due_date).toLocaleDateString('pt-BR')}
                      {isOverdue(receivable.due_date) && receivable.status === 'previsto' && (
                        <Badge variant="destructive" className="text-xs">Vencida</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    R$ {Number(receivable.amount_brl).toLocaleString('pt-BR')}
                    {receivable.currency !== 'BRL' && (
                      <div className="text-xs text-gray-500">
                        {receivable.currency} {Number(receivable.amount).toLocaleString()}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(receivable.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Receber
                      </Button>
                      <Button variant="outline" size="sm">
                        Detalhes
                      </Button>
                    </div>
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

export default AccountsReceivable;