import React, { useState } from 'react';
import { CreditCard, Plus, Download, Search, DollarSign, Calendar, AlertCircle, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const LetterOfCredit = () => {
  const [showNewLc, setShowNewLc] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const { data: letterOfCredits } = useQuery({
    queryKey: ['letter-of-credit', searchTerm, filterStatus],
    queryFn: async () => {
      let query = supabase
        .from('letter_of_credit')
        .select(`
          *,
          expeditions(expedition_code, destination)
        `)
        .order('issue_date', { ascending: false });

      if (filterStatus && ['emitida', 'confirmada', 'embarcada', 'liberada', 'vencida', 'cancelada'].includes(filterStatus)) {
        query = query.eq('status', filterStatus as 'emitida' | 'confirmada' | 'embarcada' | 'liberada' | 'vencida' | 'cancelada');
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return data?.filter(item => 
        searchTerm === '' || 
        item.lc_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.issuing_bank.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.beneficiary.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  });

  const getStatusBadge = (status: string) => {
    const statusMap = {
      emitida: { label: 'Emitida', variant: 'secondary' as const },
      confirmada: { label: 'Confirmada', variant: 'default' as const },
      embarcada: { label: 'Embarcada', variant: 'default' as const },
      liberada: { label: 'Liberada', variant: 'default' as const },
      vencida: { label: 'Vencida', variant: 'destructive' as const },
      cancelada: { label: 'Cancelada', variant: 'outline' as const }
    };
    const config = statusMap[status as keyof typeof statusMap] || statusMap.emitida;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const isNearExpiry = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 15 && diffDays > 0;
  };

  const totalAmount = letterOfCredits?.reduce((sum, item) => {
    // Assumindo USD como padrão e convertendo para BRL
    const rate = 5.2; // Taxa exemplo
    return sum + (Number(item.amount) * rate);
  }, 0) || 0;

  const activeLC = letterOfCredits?.filter(item => 
    ['emitida', 'confirmada', 'embarcada'].includes(item.status)
  ).length || 0;

  const nearExpiry = letterOfCredits?.filter(item => 
    ['emitida', 'confirmada', 'embarcada'].includes(item.status) && 
    isNearExpiry(item.expiry_date)
  ).length || 0;

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total LC</p>
                <p className="text-2xl font-bold text-purple-600">
                  R$ {totalAmount.toLocaleString('pt-BR')}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">LC Ativas</p>
                <p className="text-2xl font-bold text-green-600">{activeLC}</p>
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
                <p className="text-2xl font-bold text-red-600">{nearExpiry}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de LC</p>
                <p className="text-2xl font-bold text-blue-600">{letterOfCredits?.length || 0}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Cartas de Crédito */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Cartas de Crédito</span>
            <div className="flex gap-2">
              <Dialog open={showNewLc} onOpenChange={setShowNewLc}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova LC
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Nova Carta de Crédito</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label>Número da LC</Label>
                      <Input placeholder="Ex: LC-2024-001" />
                    </div>
                    <div className="space-y-2">
                      <Label>Banco Emissor</Label>
                      <Input placeholder="Nome do banco emissor" />
                    </div>
                    <div className="space-y-2">
                      <Label>Banco Confirmador</Label>
                      <Input placeholder="Nome do banco confirmador" />
                    </div>
                    <div className="space-y-2">
                      <Label>Beneficiário</Label>
                      <Input placeholder="Nome do beneficiário" />
                    </div>
                    <div className="space-y-2">
                      <Label>Ordenante</Label>
                      <Input placeholder="Nome do ordenante" />
                    </div>
                    <div className="space-y-2">
                      <Label>Valor</Label>
                      <Input type="number" placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                      <Label>Moeda</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a moeda" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">Dólar (USD)</SelectItem>
                          <SelectItem value="EUR">Euro (EUR)</SelectItem>
                          <SelectItem value="BRL">Real (BRL)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Data de Emissão</Label>
                      <Input type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label>Data de Vencimento</Label>
                      <Input type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label>Data Limite Embarque</Label>
                      <Input type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label>Porto de Embarque</Label>
                      <Input placeholder="Ex: Santos - SP" />
                    </div>
                    <div className="space-y-2">
                      <Label>Porto de Destino</Label>
                      <Input placeholder="Ex: Hamburg - Alemanha" />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>Descrição das Mercadorias</Label>
                      <Textarea placeholder="Descrição detalhada das mercadorias..." />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>Termos de Pagamento</Label>
                      <Textarea placeholder="Condições e termos de pagamento..." />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="partial-shipment" />
                      <Label htmlFor="partial-shipment">Embarque Parcial Permitido</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="transshipment" />
                      <Label htmlFor="transshipment">Transbordo Permitido</Label>
                    </div>
                    <div className="flex gap-2 pt-4 col-span-2">
                      <Button onClick={() => setShowNewLc(false)} variant="outline" className="flex-1">
                        Cancelar
                      </Button>
                      <Button className="flex-1">Salvar</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Documentos
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por número, banco ou beneficiário..."
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
                  <SelectItem value="emitida">Emitida</SelectItem>
                  <SelectItem value="confirmada">Confirmada</SelectItem>
                  <SelectItem value="embarcada">Embarcada</SelectItem>
                  <SelectItem value="liberada">Liberada</SelectItem>
                  <SelectItem value="vencida">Vencida</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button variant="outline" className="w-full">
                Alertas Vencimento
              </Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número LC</TableHead>
                <TableHead>Banco Emissor</TableHead>
                <TableHead>Beneficiário</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Emissão</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {letterOfCredits?.map((lc) => (
                <TableRow key={lc.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{lc.lc_number}</div>
                      {lc.expeditions && (
                        <div className="text-xs text-gray-500">
                          Exp: {lc.expeditions.expedition_code}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{lc.issuing_bank}</div>
                      {lc.confirming_bank && (
                        <div className="text-xs text-gray-500">Conf: {lc.confirming_bank}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{lc.beneficiary}</TableCell>
                  <TableCell className="font-medium">
                    {lc.currency} {Number(lc.amount).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {new Date(lc.issue_date).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {new Date(lc.expiry_date).toLocaleDateString('pt-BR')}
                      {isNearExpiry(lc.expiry_date) && ['emitida', 'confirmada', 'embarcada'].includes(lc.status) && (
                        <Badge variant="destructive" className="text-xs">Urgente</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(lc.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Embarcar
                      </Button>
                      <Button variant="outline" size="sm">
                        Documentos
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

export default LetterOfCredit;