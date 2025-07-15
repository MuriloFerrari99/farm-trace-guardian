import React, { useState } from 'react';
import { Shield, Plus, Download, Search, DollarSign, Calendar, AlertTriangle, FileText } from 'lucide-react';
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

const ExportInsurance = () => {
  const [showNewInsurance, setShowNewInsurance] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const { data: insurances } = useQuery({
    queryKey: ['export-insurance', searchTerm, filterType],
    queryFn: async () => {
      let query = supabase
        .from('export_insurance')
        .select(`
          *,
          expeditions(expedition_code, destination),
          letter_of_credit(lc_number)
        `)
        .order('policy_start_date', { ascending: false });

      if (filterType && filterType !== 'all' && ['transporte', 'credito', 'cargo', 'responsabilidade_civil'].includes(filterType)) {
        query = query.eq('insurance_type', filterType as 'transporte' | 'credito' | 'cargo' | 'responsabilidade_civil');
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return data?.filter(item => 
        searchTerm === '' || 
        item.policy_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.insurance_company.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  });

  const getInsuranceTypeBadge = (type: string) => {
    const typeMap = {
      transporte: { label: 'Transporte', variant: 'default' as const },
      credito: { label: 'Crédito', variant: 'secondary' as const },
      cargo: { label: 'Cargo', variant: 'outline' as const },
      responsabilidade_civil: { label: 'Resp. Civil', variant: 'destructive' as const }
    };
    const config = typeMap[type as keyof typeof typeMap] || typeMap.transporte;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const isNearExpiry = (endDate: string) => {
    const expiry = new Date(endDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  const isActive = (startDate: string, endDate: string) => {
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    return today >= start && today <= end;
  };

  const totalCoverage = insurances?.reduce((sum, item) => {
    // Assumindo USD como padrão e convertendo para BRL
    const rate = 5.2; // Taxa exemplo
    return sum + (Number(item.coverage_amount) * (item.currency === 'BRL' ? 1 : rate));
  }, 0) || 0;

  const activePolicies = insurances?.filter(item => 
    isActive(item.policy_start_date, item.policy_end_date)
  ).length || 0;

  const nearExpiry = insurances?.filter(item => 
    isActive(item.policy_start_date, item.policy_end_date) && 
    isNearExpiry(item.policy_end_date)
  ).length || 0;

  const claimsCount = insurances?.filter(item => item.claim_status).length || 0;

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cobertura Total</p>
                <p className="text-2xl font-bold text-blue-600">
                  R$ {totalCoverage.toLocaleString('pt-BR')}
                </p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Apólices Ativas</p>
                <p className="text-2xl font-bold text-green-600">{activePolicies}</p>
              </div>
              <FileText className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Próximos Vencimentos</p>
                <p className="text-2xl font-bold text-orange-600">{nearExpiry}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sinistros</p>
                <p className="text-2xl font-bold text-red-600">{claimsCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Seguros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Seguros de Exportação</span>
            <div className="flex gap-2">
              <Dialog open={showNewInsurance} onOpenChange={setShowNewInsurance}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Seguro
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Novo Seguro de Exportação</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label>Número da Apólice</Label>
                      <Input placeholder="Ex: POL-2024-001" />
                    </div>
                    <div className="space-y-2">
                      <Label>Seguradora</Label>
                      <Input placeholder="Nome da seguradora" />
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo de Seguro</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="transporte">Transporte</SelectItem>
                          <SelectItem value="credito">Crédito</SelectItem>
                          <SelectItem value="cargo">Cargo</SelectItem>
                          <SelectItem value="responsabilidade_civil">Responsabilidade Civil</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Valor do Prêmio</Label>
                      <Input type="number" placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                      <Label>Valor da Cobertura</Label>
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
                      <Label>Data de Início</Label>
                      <Input type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label>Data de Término</Label>
                      <Input type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label>Valor da Franquia</Label>
                      <Input type="number" placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                      <Label>Origem da Rota</Label>
                      <Input placeholder="Ex: Santos - SP" />
                    </div>
                    <div className="space-y-2">
                      <Label>Destino da Rota</Label>
                      <Input placeholder="Ex: Hamburg - Alemanha" />
                    </div>
                    <div className="space-y-2">
                      <Label>Nome do Navio</Label>
                      <Input placeholder="Nome do navio" />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>Descrição da Carga</Label>
                      <Textarea placeholder="Descrição detalhada da carga segurada..." />
                    </div>
                    <div className="flex gap-2 pt-4 col-span-2">
                      <Button onClick={() => setShowNewInsurance(false)} variant="outline" className="flex-1">
                        Cancelar
                      </Button>
                      <Button className="flex-1">Salvar</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Certificados
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por apólice ou seguradora..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="transporte">Transporte</SelectItem>
                  <SelectItem value="credito">Crédito</SelectItem>
                  <SelectItem value="cargo">Cargo</SelectItem>
                  <SelectItem value="responsabilidade_civil">Responsabilidade Civil</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button variant="outline" className="w-full">
                Registrar Sinistro
              </Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Apólice</TableHead>
                <TableHead>Seguradora</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Cobertura</TableHead>
                <TableHead>Vigência</TableHead>
                <TableHead>Expedição</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {insurances?.map((insurance) => (
                <TableRow key={insurance.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{insurance.policy_number}</div>
                      {insurance.claim_status && (
                        <div className="text-xs text-red-500">Sinistro: {insurance.claim_status}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{insurance.insurance_company}</TableCell>
                  <TableCell>{getInsuranceTypeBadge(insurance.insurance_type)}</TableCell>
                  <TableCell className="font-medium">
                    {insurance.currency} {Number(insurance.coverage_amount).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">
                        {new Date(insurance.policy_start_date).toLocaleDateString('pt-BR')} - {new Date(insurance.policy_end_date).toLocaleDateString('pt-BR')}
                      </div>
                      {isNearExpiry(insurance.policy_end_date) && isActive(insurance.policy_start_date, insurance.policy_end_date) && (
                        <Badge variant="destructive" className="text-xs mt-1">Vence em breve</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {insurance.expeditions ? (
                      <div>
                        <div className="font-medium">{insurance.expeditions.expedition_code}</div>
                        <div className="text-xs text-gray-500">{insurance.expeditions.destination}</div>
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={isActive(insurance.policy_start_date, insurance.policy_end_date) ? 'default' : 'secondary'}>
                      {isActive(insurance.policy_start_date, insurance.policy_end_date) ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Certificado
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

export default ExportInsurance;