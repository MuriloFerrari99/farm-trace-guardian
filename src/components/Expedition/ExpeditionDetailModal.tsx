import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Truck, Package, MapPin, Calendar, Weight, Users } from 'lucide-react';

interface ExpeditionDetailModalProps {
  expedition: any;
  open: boolean;
  onClose: () => void;
}

export default function ExpeditionDetailModal({ 
  expedition, 
  open, 
  onClose 
}: ExpeditionDetailModalProps) {
  if (!expedition) return null;

  const formatWeight = (weight: number) => {
    return `${weight.toFixed(2)} kg`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Detalhes da Expedição {expedition.expedition_code}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Gerais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Informações Gerais
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Data:</span>
                  <span className="font-medium">
                    {format(new Date(expedition.expedition_date), 'dd/MM/yyyy', { locale: ptBR })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Destino:</span>
                  <span className="font-medium">{expedition.destination}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Weight className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Peso Total:</span>
                  <span className="font-medium">{formatWeight(expedition.total_weight_kg)}</span>
                </div>
              </div>
              <div className="space-y-2">
                {expedition.transporter && (
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Transportadora:</span>
                    <span className="font-medium">{expedition.transporter}</span>
                  </div>
                )}
                {expedition.vehicle_plate && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Placa:</span>
                    <Badge variant="outline">{expedition.vehicle_plate}</Badge>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Total de Lotes:</span>
                  <Badge>{expedition.expedition_items?.length || 0} lotes</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lotes Expedidos */}
          {expedition.expedition_items && expedition.expedition_items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Lotes Expedidos</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código Recepção</TableHead>
                      <TableHead>Produtor</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Data Recepção</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expedition.expedition_items.map((item: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {item.receptions?.reception_code || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {item.receptions?.producers?.name || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {item.receptions?.product_type || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {item.receptions?.quantity_kg ? formatWeight(item.receptions.quantity_kg) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {item.receptions?.reception_date 
                            ? format(new Date(item.receptions.reception_date), 'dd/MM/yyyy', { locale: ptBR })
                            : 'N/A'
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}