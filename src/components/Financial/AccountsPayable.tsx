import React, { useState } from 'react';
import { CreditCard, Plus, Download, Search, DollarSign, Calendar, AlertTriangle } from 'lucide-react';
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

const AccountsPayable = () => {
  const [showNewPayable, setShowNewPayable] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const { data: payables } = useQuery({
    queryKey: ['accounts-payable', searchTerm, filterStatus],
    queryFn: async () => {
      let query = supabase
        .from('accounts_payable')
        .select(`
          *,
          producers(name),
          receptions(reception_code)
        `)
        .order('due_date', { ascending: true });

      if (filterStatus && ['previsto', 'realizado', 'cancelado'].includes(filterStatus)) {
        query = query.eq('status', filterStatus as 'previsto' | 'realizado' | 'cancelado');
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return data?.filter(item => 
        searchTerm === '' || 
        item.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.invoice_number && item.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
  });

  const getStatusBadge = (status: string) => {
    const statusMap = {
      previsto: { label: 'A Pagar', variant: 'secondary' as const },
      realizado: { label: 'Pago', variant: 'default' as const },
      cancelado: { label: 'Cancelado', variant: 'destructive' as const }
    };
    const config = statusMap[status as keyof typeof statusMap] || statusMap.previsto;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPaymentMethodBadge = (method: string) => {
    const methodMap = {
      boleto: 'Boleto',
      transferencia: 'Transferência',
      cheque: 'Cheque',
      cartao: 'Cartão',
      pix: 'PIX',
      swift: 'SWIFT'
    };
    return <Badge variant="outline">{methodMap[method as keyof typeof methodMap] || method}</Badge>;
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const totalAmount = payables?.reduce((sum, item) => sum + Number(item.amount_brl), 0) || 0;
  const overdueAmount = payables?.filter(item => isOverdue(item.due_date) && item.status === 'previsto')
    .reduce((sum, item) => sum + Number(item.amount_brl), 0) || 0;
  const paidAmount = payables?.filter(item => item.status === 'realizado')
    .reduce((sum, item) => sum + Number(item.amount_paid || item.amount_brl), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total a Pagar</p>
                <p className="text-2xl font-bold text-red-600">
                  R$ {totalAmount.toLocaleString('pt-BR')}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vencidas</p>
                <p className="text-2xl font-bold text-orange-600">
                  R$ {overdueAmount.toLocaleString('pt-BR')}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Já Pago</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {paidAmount.toLocaleString('pt-BR')}
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
                <p className="text-sm font-medium text-gray-600">Total de Contas</p>
                <p className="text-2xl font-bold text-purple-600">
                  {payables?.length || 0}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Contas a Pagar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Contas a Pagar</span>
            <div className="flex gap-2">
              <Dialog open={showNewPayable} onOpenChange={setShowNewPayable}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Conta
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Nova Conta a Pagar</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Fornecedor</Label>
                      <Input placeholder="Nome do fornecedor" />
                    </div>
                    <div className="space-y-2">
                      <Label>Número da Fatura</Label>
                      <Input placeholder="Ex: NF-2024-001" />
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
                      <Label>Forma de Pagamento</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a forma" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pix">PIX</SelectItem>
                          <SelectItem value="transferencia">Transferência</SelectItem>
                          <SelectItem value="boleto">Boleto</SelectItem>
                          <SelectItem value="cheque">Cheque</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button onClick={() => setShowNewPayable(false)} variant="outline" className="flex-1">
                        Cancelar
                      </Button>
                      <Button className="flex-1">Salvar</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                CNAB/SWIFT
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por fornecedor ou fatura..."
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
                  <SelectItem value="">Todos os status</SelectItem>
                  <SelectItem value="previsto">A Pagar</SelectItem>
                  <SelectItem value="realizado">Pago</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button variant="outline" className="w-full">
                Agendar Pagamentos
              </Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Fatura</TableHead>
                <TableHead>Data Emissão</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Forma Pagamento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payables?.map((payable) => (
                <TableRow 
                  key={payable.id}
                  className={isOverdue(payable.due_date) && payable.status === 'previsto' ? 'bg-orange-50' : ''}
                >
                  <TableCell>
                    <div>
                      <div className="font-medium">{payable.supplier_name}</div>
                      {payable.producers && (
                        <div className="text-xs text-gray-500">Produtor: {payable.producers.name}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      {payable.invoice_number || '-'}
                      {payable.receptions && (
                        <div className="text-xs text-gray-500">Recep: {payable.receptions.reception_code}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(payable.issue_date).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {new Date(payable.due_date).toLocaleDateString('pt-BR')}
                      {isOverdue(payable.due_date) && payable.status === 'previsto' && (
                        <Badge variant="destructive" className="text-xs">Vencida</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    R$ {Number(payable.amount_brl).toLocaleString('pt-BR')}
                    {payable.currency !== 'BRL' && (
                      <div className="text-xs text-gray-500">
                        {payable.currency} {Number(payable.amount).toLocaleString()}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {payable.payment_method ? getPaymentMethodBadge(payable.payment_method) : '-'}
                  </TableCell>
                  <TableCell>{getStatusBadge(payable.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Pagar
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

export default AccountsPayable;