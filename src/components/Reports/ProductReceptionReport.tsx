import React, { useState } from 'react';
import { CalendarDays, Download, Search, Filter, Package, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useReceptions } from '@/hooks/useReceptions';
import { useProducers } from '@/hooks/useProducers';

const ProductReceptionReport = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProducer, setFilterProducer] = useState('');
  const [filterProduct, setFilterProduct] = useState('');
  const { receptions } = useReceptions();
  const { producers } = useProducers();

  const filteredReceptions = receptions?.filter(reception => {
    const matchesSearch = searchTerm === '' || 
      reception.reception_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reception.lot_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesProducer = filterProducer === '' || reception.producer_id === filterProducer;
    const matchesProduct = filterProduct === '' || reception.product_type === filterProduct;
    
    return matchesSearch && matchesProducer && matchesProduct;
  }) || [];

  const totalVolume = filteredReceptions.reduce((sum, reception) => sum + Number(reception.quantity_kg), 0);
  const averageVolume = filteredReceptions.length > 0 ? totalVolume / filteredReceptions.length : 0;

  const getProducerName = (producerId: string) => {
    const producer = producers?.find(p => p.id === producerId);
    return producer?.name || 'N/A';
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: 'Pendente', variant: 'secondary' as const },
      approved: { label: 'Aprovado', variant: 'default' as const },
      rejected: { label: 'Rejeitado', variant: 'destructive' as const }
    };
    const config = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Relatório
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Código ou lote..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Produtor</label>
              <Select value={filterProducer} onValueChange={setFilterProducer}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os produtores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os produtores</SelectItem>
                  {producers?.map(producer => (
                    <SelectItem key={producer.id} value={producer.id}>
                      {producer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Produto</label>
              <Select value={filterProduct} onValueChange={setFilterProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os produtos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os produtos</SelectItem>
                  <SelectItem value="tomate">Tomate</SelectItem>
                  <SelectItem value="alface">Alface</SelectItem>
                  <SelectItem value="pepino">Pepino</SelectItem>
                  <SelectItem value="pimentao">Pimentão</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
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
                <p className="text-sm font-medium text-gray-600">Total de Lotes</p>
                <p className="text-2xl font-bold">{filteredReceptions.length}</p>
              </div>
              <CalendarDays className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Volume Total (kg)</p>
                <p className="text-2xl font-bold">{totalVolume.toLocaleString()}</p>
              </div>
              <Package className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Volume Médio (kg)</p>
                <p className="text-2xl font-bold">{averageVolume.toFixed(0)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Produtores Únicos</p>
                <p className="text-2xl font-bold">
                  {new Set(filteredReceptions.map(r => r.producer_id)).size}
                </p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Dados */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento das Entradas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Produtor</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Lote</TableHead>
                <TableHead>Volume (kg)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Documentos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReceptions.map((reception) => (
                <TableRow key={reception.id}>
                  <TableCell className="font-medium">{reception.reception_code}</TableCell>
                  <TableCell>
                    {new Date(reception.reception_date).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>{getProducerName(reception.producer_id)}</TableCell>
                  <TableCell className="capitalize">{reception.product_type}</TableCell>
                  <TableCell>{reception.lot_number || '-'}</TableCell>
                  <TableCell>{Number(reception.quantity_kg).toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(reception.status || 'pending')}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      Ver Anexos
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

export default ProductReceptionReport;