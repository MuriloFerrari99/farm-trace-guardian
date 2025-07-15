import React, { useState } from 'react';
import { Package, Users, Calendar, Download, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const ConsolidatedLotsReport = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: consolidatedLots } = useQuery({
    queryKey: ['consolidated-lots-report'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('consolidated_lots')
        .select(`
          *,
          consolidated_lot_items(
            quantity_used_kg,
            receptions(
              reception_code,
              lot_number,
              producers(name, ggn)
            )
          ),
          generated_labels(
            id,
            label_layout,
            status,
            generated_at
          ),
          profiles!consolidated_by(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const filteredLots = consolidatedLots?.filter(lot => 
    searchTerm === '' || 
    lot.consolidation_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lot.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lot.internal_lot_number?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const totalQuantity = filteredLots.reduce((sum, lot) => sum + Number(lot.total_quantity_kg), 0);
  const totalLabels = filteredLots.reduce((sum, lot) => sum + (lot.generated_labels?.length || 0), 0);

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { label: 'Ativo', variant: 'default' as const },
      shipped: { label: 'Expedido', variant: 'secondary' as const },
      consumed: { label: 'Consumido', variant: 'outline' as const }
    };
    const config = statusMap[status as keyof typeof statusMap] || statusMap.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Pesquisar Lotes Consolidados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Código, cliente ou lote interno..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Button className="w-full md:w-auto">
              <Download className="h-4 w-4 mr-2" />
              Exportar Relatório
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Lotes Consolidados</p>
                <p className="text-2xl font-bold">{filteredLots.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Volume Total (kg)</p>
                <p className="text-2xl font-bold">{totalQuantity.toLocaleString()}</p>
              </div>
              <Package className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Etiquetas Geradas</p>
                <p className="text-2xl font-bold">{totalLabels}</p>
              </div>
              <Badge variant="outline" className="text-purple-600">Labels</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Clientes Únicos</p>
                <p className="text-2xl font-bold">
                  {new Set(filteredLots.filter(l => l.client_name).map(l => l.client_name)).size}
                </p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela Detalhada */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento dos Lotes Consolidados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Data Consolidação</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Volume (kg)</TableHead>
                <TableHead>Produtores</TableHead>
                <TableHead>Etiquetas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLots.map((lot) => (
                <TableRow key={lot.id}>
                  <TableCell className="font-medium">{lot.consolidation_code}</TableCell>
                  <TableCell>
                    {lot.consolidation_date ? 
                      new Date(lot.consolidation_date).toLocaleDateString('pt-BR') : 
                      '-'
                    }
                  </TableCell>
                  <TableCell>{lot.client_name || '-'}</TableCell>
                  <TableCell className="capitalize">{lot.product_type}</TableCell>
                  <TableCell>{Number(lot.total_quantity_kg).toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {lot.consolidated_lot_items?.map((item: any, index: number) => (
                        <div key={index} className="text-xs">
                          {item.receptions?.producers?.name} - {Number(item.quantity_used_kg).toFixed(0)}kg
                        </div>
                      )).slice(0, 2)}
                      {(lot.consolidated_lot_items?.length || 0) > 2 && (
                        <div className="text-xs text-gray-500">
                          +{(lot.consolidated_lot_items?.length || 0) - 2} mais
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {lot.generated_labels?.length || 0} etiquetas
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(lot.status || 'active')}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Detalhes
                      </Button>
                      <Button variant="outline" size="sm">
                        Rastrear
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

export default ConsolidatedLotsReport;