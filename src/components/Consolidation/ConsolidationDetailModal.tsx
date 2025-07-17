import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, User, Calendar, Weight, Truck } from 'lucide-react';
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

interface ConsolidationDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  consolidation: ConsolidatedLot | null;
}

const ConsolidationDetailModal = ({
  open,
  onOpenChange,
  consolidation,
}: ConsolidationDetailModalProps) => {
  if (!consolidation) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Detalhes da Consolidação: {consolidation.consolidation_code}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Gerais */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informações Gerais</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Cliente:</span>
                  <span>{consolidation.client_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Produto:</span>
                  <Badge variant="outline">{consolidation.product_type}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Weight className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Quantidade Total:</span>
                  <span>{consolidation.total_quantity_kg.toFixed(2)} kg</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Data:</span>
                  <span>
                    {consolidation.consolidation_date 
                      ? new Date(consolidation.consolidation_date).toLocaleDateString('pt-BR')
                      : 'N/A'
                    }
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Status e Códigos</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Status:</span>
                  <Badge variant={consolidation.status === 'active' ? 'default' : 'secondary'}>
                    {consolidation.status === 'active' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Lote Cliente:</span>
                  <span>{consolidation.client_lot_number || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Lote Interno:</span>
                  <span>{consolidation.internal_lot_number || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Lotes Originais:</span>
                  <Badge variant="secondary">
                    {consolidation.consolidated_lot_items?.length || 0} lotes
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Notas */}
          {consolidation.notes && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Observações</h3>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                {consolidation.notes}
              </p>
            </div>
          )}

          {/* Lotes Originais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Lotes Originais Consolidados</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código Recepção</TableHead>
                  <TableHead>Produtor</TableHead>
                  <TableHead>Fazenda</TableHead>
                  <TableHead>Quantidade Original</TableHead>
                  <TableHead>Quantidade Utilizada</TableHead>
                  <TableHead>Data Recepção</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consolidation.consolidated_lot_items?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.receptions.reception_code}
                    </TableCell>
                    <TableCell>{item.receptions.producers.name}</TableCell>
                    <TableCell>{item.receptions.producers.farm_name || 'N/A'}</TableCell>
                    <TableCell>{item.receptions.quantity_kg.toFixed(2)} kg</TableCell>
                    <TableCell className="font-medium">
                      {item.quantity_used_kg.toFixed(2)} kg
                    </TableCell>
                    <TableCell>
                      {new Date(item.receptions.reception_date).toLocaleDateString('pt-BR')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConsolidationDetailModal;