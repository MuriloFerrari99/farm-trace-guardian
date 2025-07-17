import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useConsolidation } from '@/hooks/useConsolidation';
import { Package, Eye, Calendar, User } from 'lucide-react';

const ConsolidatedLotsList = () => {
  const { consolidatedLots, isLoading } = useConsolidation();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Lotes Consolidados</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-500">Carregando consolidações...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!consolidatedLots || consolidatedLots.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Lotes Consolidados</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum lote consolidado encontrado</p>
            <p className="text-sm mt-1">Crie sua primeira consolidação acima</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Package className="h-5 w-5" />
          <span>Histórico de Consolidações ({consolidatedLots.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead>Quantidade Total</TableHead>
              <TableHead>Lotes Originais</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {consolidatedLots.map((consolidation) => (
              <TableRow key={consolidation.id}>
                <TableCell className="font-medium">{consolidation.consolidation_code}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    {consolidation.client_name}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{consolidation.product_type}</Badge>
                </TableCell>
                <TableCell>{consolidation.total_quantity_kg.toFixed(2)} kg</TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {consolidation.consolidated_lot_items?.length || 0} lotes
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {consolidation.consolidation_date 
                      ? new Date(consolidation.consolidation_date).toLocaleDateString('pt-BR')
                      : 'N/A'
                    }
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={consolidation.status === 'active' ? 'default' : 'secondary'}>
                    {consolidation.status === 'active' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-1" />
                    Detalhes
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ConsolidatedLotsList;