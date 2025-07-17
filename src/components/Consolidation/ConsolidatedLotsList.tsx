import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useConsolidation } from '@/hooks/useConsolidation';
import { Package, Eye, Calendar, User, Trash2 } from 'lucide-react';
import ConsolidationDetailModal from './ConsolidationDetailModal';
import { Database } from '@/integrations/supabase/types';

type ConsolidatedLot = Database['public']['Tables']['consolidated_lots']['Row'] & {
  consolidated_lot_items: Array<
    Database['public']['Tables']['consolidated_lot_items']['Row'] & {
      receptions: Database['public']['Tables']['receptions']['Row'] & {
        producers: Database['public']['Tables']['producers']['Row'];
      };
    }
  >;
};

const ConsolidatedLotsList = () => {
  const { consolidatedLots, isLoading, deleteConsolidation } = useConsolidation();
  const [selectedConsolidation, setSelectedConsolidation] = useState<ConsolidatedLot | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const handleDelete = async (consolidationId: string) => {
    await deleteConsolidation.mutateAsync(consolidationId);
  };

  const handleViewDetails = (consolidation: ConsolidatedLot) => {
    setSelectedConsolidation(consolidation);
    setDetailModalOpen(true);
  };

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
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleViewDetails(consolidation)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Detalhes
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir Consolidação</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir a consolidação {consolidation.consolidation_code}? 
                            Esta ação não pode ser desfeita e os lotes voltarão a estar disponíveis.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(consolidation.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      
      <ConsolidationDetailModal
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        consolidation={selectedConsolidation}
      />
    </Card>
  );
};

export default ConsolidatedLotsList;