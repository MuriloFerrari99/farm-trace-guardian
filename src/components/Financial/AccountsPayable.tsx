import React, { useState } from 'react';
import { CreditCard, Plus, Download, Search, DollarSign, Calendar, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAccountsPayable } from '@/hooks/useFinancial';
import { AccountsPayableForm } from './AccountsPayableForm';

const AccountsPayable = () => {
  const [showNewPayable, setShowNewPayable] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const { payables, isLoading } = useAccountsPayable();

  // Filter payables based on search and status
  const filteredPayables = payables?.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.invoice_number && item.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus && ['previsto', 'realizado', 'cancelado'].includes(filterStatus) && item.status === filterStatus);
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

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

  const totalAmount = filteredPayables?.reduce((sum, item) => sum + Number(item.amount_brl || item.amount), 0) || 0;
  const overdueAmount = filteredPayables?.filter(item => isOverdue(item.due_date) && item.status === 'previsto')
    .reduce((sum, item) => sum + Number(item.amount_brl || item.amount), 0) || 0;
  const paidAmount = filteredPayables?.filter(item => item.status === 'realizado')
    .reduce((sum, item) => sum + Number(item.amount_paid || item.amount_brl || item.amount), 0) || 0;

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
                  {filteredPayables?.length || 0}
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
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Nova Conta a Pagar</DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <AccountsPayableForm onSuccess={() => setShowNewPayable(false)} />
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
                  <SelectItem value="all">Todos os status</SelectItem>
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
              {filteredPayables?.map((payable) => (
                <TableRow 
                  key={payable.id}
                  className={isOverdue(payable.due_date) && payable.status === 'previsto' ? 'bg-orange-50' : ''}
                >
                  <TableCell>
                    <div>
                      <div className="font-medium">{payable.supplier_name}</div>
                      {payable.producer_id && (
                        <div className="text-xs text-gray-500">Produtor ID: {payable.producer_id}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      {payable.invoice_number || '-'}
                      {payable.reception_id && (
                        <div className="text-xs text-gray-500">Recep ID: {payable.reception_id}</div>
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
                    R$ {Number(payable.amount_brl || payable.amount).toLocaleString('pt-BR')}
                    {payable.currency && payable.currency !== 'BRL' && (
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