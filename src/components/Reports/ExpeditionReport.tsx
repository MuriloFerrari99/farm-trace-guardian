import React, { useState } from 'react';
import { Truck, Calendar, MapPin, AlertTriangle, Download, Filter, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useExpeditions } from '@/hooks/useExpeditions';

const ExpeditionReport = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDestination, setFilterDestination] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  const { expeditions } = useExpeditions();

  const filteredExpeditions = expeditions?.filter(expedition => {
    const matchesSearch = searchTerm === '' || 
      expedition.expedition_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expedition.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expedition.transporter?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDestination = filterDestination === '' || 
      expedition.destination.toLowerCase().includes(filterDestination.toLowerCase());
    
    // Para demonstração, vamos assumir que expedições são "active" por padrão
    const matchesStatus = filterStatus === '' || filterStatus === 'active';
    
    return matchesSearch && matchesDestination && matchesStatus;
  }) || [];

  const totalWeight = filteredExpeditions.reduce((sum, exp) => sum + Number(exp.total_weight_kg), 0);
  const uniqueDestinations = new Set(filteredExpeditions.map(exp => exp.destination)).size;
  const uniqueTransporters = new Set(filteredExpeditions.filter(exp => exp.transporter).map(exp => exp.transporter)).size;

  // Simulação de não conformidades para demonstração
  const nonConformities = [
    {
      expedition_code: 'EXP-001',
      type: 'Atraso',
      description: 'Expedição atrasada em 2 horas devido ao trânsito',
      date: '2024-01-15',
      severity: 'medium'
    },
    {
      expedition_code: 'EXP-003',
      type: 'Temperatura',
      description: 'Temperatura do contêiner acima do limite',
      date: '2024-01-10',
      severity: 'high'
    },
    {
      expedition_code: 'EXP-005',
      type: 'Documentação',
      description: 'Certificado fitossanitário em atraso',
      date: '2024-01-08',
      severity: 'low'
    }
  ];

  const getSeverityBadge = (severity: string) => {
    const severityMap = {
      low: { label: 'Baixa', variant: 'outline' as const },
      medium: { label: 'Média', variant: 'secondary' as const },
      high: { label: 'Alta', variant: 'destructive' as const }
    };
    const config = severityMap[severity as keyof typeof severityMap] || severityMap.low;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Expedição
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Buscar</label>
              <Input
                placeholder="Código, destino, transportadora..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Destino</label>
              <Input
                placeholder="Filtrar por destino..."
                value={filterDestination}
                onChange={(e) => setFilterDestination(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os status</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Expedições</p>
                <p className="text-2xl font-bold">{filteredExpeditions.length}</p>
              </div>
              <Truck className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Peso Total (kg)</p>
                <p className="text-2xl font-bold">{totalWeight.toLocaleString()}</p>
              </div>
              <Package className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Destinos Únicos</p>
                <p className="text-2xl font-bold">{uniqueDestinations}</p>
              </div>
              <MapPin className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Transportadoras</p>
                <p className="text-2xl font-bold">{uniqueTransporters}</p>
              </div>
              <Truck className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Expedições */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento das Expedições</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead>Transportadora</TableHead>
                <TableHead>Veículo</TableHead>
                <TableHead>Peso (kg)</TableHead>
                <TableHead>Documentos</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpeditions.map((expedition) => (
                <TableRow key={expedition.id}>
                  <TableCell className="font-medium">{expedition.expedition_code}</TableCell>
                  <TableCell>
                    {new Date(expedition.expedition_date).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>{expedition.destination}</TableCell>
                  <TableCell>{expedition.transporter || '-'}</TableCell>
                  <TableCell>{expedition.vehicle_plate || '-'}</TableCell>
                  <TableCell>{Number(expedition.total_weight_kg).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {expedition.expedition_documents?.length || 0} docs
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Detalhes
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

      {/* Não Conformidades */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Registro de Não Conformidades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Expedição</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Severidade</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {nonConformities.map((nc, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {new Date(nc.date).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="font-medium">{nc.expedition_code}</TableCell>
                  <TableCell>{nc.type}</TableCell>
                  <TableCell>{nc.description}</TableCell>
                  <TableCell>{getSeverityBadge(nc.severity)}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      Resolver
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

export default ExpeditionReport;