import React, { useState } from 'react';
import { Banknote, Plus, Download, Search, DollarSign, Calendar, AlertTriangle, Building } from 'lucide-react';
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

const AccContracts = () => {
  const [showNewAcc, setShowNewAcc] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const { data: accContracts } = useQuery({
    queryKey: ['acc-contracts', searchTerm, filterStatus],
    queryFn: async () => {
      let query = supabase
        .from('acc_contracts')
        .select(`
          *,
          expeditions(expedition_code, destination),
          producers(name, ggn)
        `)
        .order('contract_date', { ascending: false });

      if (filterStatus && ['aberto', 'liquidado', 'vencido', 'cancelado'].includes(filterStatus)) {
        query = query.eq('status', filterStatus as 'aberto' | 'liquidado' | 'vencido' | 'cancelado');
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return data?.filter(item => 
        searchTerm === '' || 
        item.contract_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.bank_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  });

  const getStatusBadge = (status: string) => {
    const statusMap = {
      aberto: { label: 'Aberto', variant: 'default' as const },
      liquidado: { label: 'Liquidado', variant: 'secondary' as const },
      vencido: { label: 'Vencido', variant: 'destructive' as const },
      cancelado: { label: 'Cancelado', variant: 'outline' as const }
    };
    const config = statusMap[status as keyof typeof statusMap] || statusMap.aberto;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const isNearMaturity = (maturityDate: string) => {
    const maturity = new Date(maturityDate);
    const today = new Date();
    const diffTime = maturity.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  const totalAmount = accContracts?.reduce((sum, item) => sum + Number(item.amount_brl), 0) || 0;
  const openContracts = accContracts?.filter(item => item.status === 'aberto').length || 0;
  const nearMaturity = accContracts?.filter(item => 
    item.status === 'aberto' && isNearMaturity(item.maturity_date)
  ).length || 0;

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total ACC</p>
                <p className="text-2xl font-bold text-blue-600">
                  R$ {totalAmount.toLocaleString('pt-BR')}
                </p>
              </div>
              <Banknote className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Contratos Abertos</p>
                <p className="text-2xl font-bold text-green-600">{openContracts}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Próximos Vencimentos</p>
                <p className="text-2xl font-bold text-orange-600">{nearMaturity}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa Média</p>
                <p className="text-2xl font-bold text-purple-600">
                  {accContracts && accContracts.length > 0 
                    ? (accContracts.reduce((sum, item) => sum + Number(item.interest_rate), 0) / accContracts.length).toFixed(2)
                    : '0.00'}%
                </p>
              </div>
              <Building className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Contratos ACC */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Contratos ACC</span>
            <div className="flex gap-2">
              <Dialog open={showNewAcc} onOpenChange={setShowNewAcc}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo ACC
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Novo Contrato ACC</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label>Número do Contrato</Label>
                      <Input placeholder="Ex: ACC-2024-001" />
                    </div>
                    <div className="space-y-2">
                      <Label>Banco</Label>
                      <Input placeholder="Nome do banco" />
                    </div>
                    <div className="space-y-2">
                      <Label>Valor USD</Label>
                      <Input type="number" placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                      <Label>Taxa de Câmbio</Label>
                      <Input type="number" step="0.0001" placeholder="5.0000" />
                    </div>
                    <div className="space-y-2">
                      <Label>Taxa de Juros (%)</Label>
                      <Input type="number" step="0.01" placeholder="12.50" />
                    </div>
                    <div className="space-y-2">
                      <Label>Data de Vencimento</Label>
                      <Input type="date" />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>Observações</Label>
                      <Textarea placeholder="Observações sobre o contrato..." />
                    </div>
                    <div className="flex gap-2 pt-4 col-span-2">
                      <Button onClick={() => setShowNewAcc(false)} variant="outline" className="flex-1">
                        Cancelar
                      </Button>
                      <Button className="flex-1">Salvar</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Relatório
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por contrato ou banco..."
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
                  <SelectItem value="aberto">Aberto</SelectItem>
                  <SelectItem value="liquidado">Liquidado</SelectItem>
                  <SelectItem value="vencido">Vencido</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button variant="outline" className="w-full">
                Exportar Excel
              </Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contrato</TableHead>
                <TableHead>Banco</TableHead>
                <TableHead>Valor USD</TableHead>
                <TableHead>Valor BRL</TableHead>
                <TableHead>Taxa Juros</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accContracts?.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{contract.contract_number}</div>
                      {contract.expeditions && (
                        <div className="text-xs text-gray-500">
                          Exp: {contract.expeditions.expedition_code}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{contract.bank_name}</div>
                      {contract.bank_code && (
                        <div className="text-xs text-gray-500">{contract.bank_code}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    USD {Number(contract.amount_usd).toLocaleString()}
                  </TableCell>
                  <TableCell className="font-medium">
                    R$ {Number(contract.amount_brl).toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell>{Number(contract.interest_rate).toFixed(2)}%</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {new Date(contract.maturity_date).toLocaleDateString('pt-BR')}
                      {isNearMaturity(contract.maturity_date) && contract.status === 'aberto' && (
                        <Badge variant="destructive" className="text-xs">Próximo</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(contract.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Liquidar
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

export default AccContracts;