import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useExpeditions } from '@/hooks/useExpeditions';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Truck, Package, FileText, Eye } from 'lucide-react';

export default function ExpeditionsList() {
  const { expeditions, loading } = useExpeditions();

  const getStatusBadge = (expedition: any) => {
    const isRecent = new Date(expedition.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000);
    return (
      <Badge variant={isRecent ? "default" : "secondary"}>
        {isRecent ? "Recente" : "Expedido"}
      </Badge>
    );
  };

  const formatWeight = (weight: number) => {
    return `${weight.toFixed(2)} kg`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Expedições Registradas
        </CardTitle>
        <CardDescription>
          Histórico de todas as expedições realizadas
        </CardDescription>
      </CardHeader>
      <CardContent>
        {expeditions.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma expedição registrada ainda</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead>Transportadora</TableHead>
                <TableHead>Placa</TableHead>
                <TableHead>Peso Total</TableHead>
                <TableHead>Lotes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expeditions.map((expedition) => (
                <TableRow key={expedition.id}>
                  <TableCell className="font-medium">
                    {expedition.expedition_code}
                  </TableCell>
                  <TableCell>
                    {format(new Date(expedition.expedition_date), 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell>{expedition.destination}</TableCell>
                  <TableCell>{expedition.transporter || "-"}</TableCell>
                  <TableCell>{expedition.vehicle_plate || "-"}</TableCell>
                  <TableCell>{formatWeight(expedition.total_weight_kg)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {expedition.expedition_items?.length || 0} lotes
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(expedition)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}