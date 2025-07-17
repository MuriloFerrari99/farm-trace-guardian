import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useExpeditions } from '@/hooks/useExpeditions';
import ExpeditionDetailModal from './ExpeditionDetailModal';
import ExpeditionDocuments from './ExpeditionDocuments';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Truck, Package, FileText, Eye, Trash2 } from 'lucide-react';

export default function ExpeditionsList() {
  const { expeditions, loading, deleteExpedition } = useExpeditions();
  const [selectedExpedition, setSelectedExpedition] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDocuments, setShowDocuments] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [expeditionToDelete, setExpeditionToDelete] = useState<any>(null);

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

  const handleViewDetails = (expedition: any) => {
    setSelectedExpedition(expedition);
    setShowDetailModal(true);
  };

  const handleViewDocuments = (expedition: any) => {
    setSelectedExpedition(expedition);
    setShowDocuments(true);
  };

  const handleDeleteClick = (expedition: any) => {
    setExpeditionToDelete(expedition);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (expeditionToDelete) {
      try {
        await deleteExpedition(expeditionToDelete.id);
        setShowDeleteDialog(false);
        setExpeditionToDelete(null);
      } catch (error) {
        console.error('Error deleting expedition:', error);
      }
    }
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
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewDetails(expedition)}
                        title="Ver Detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewDocuments(expedition)}
                        title="Ver Documentos"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeleteClick(expedition)}
                        title="Excluir"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Modals */}
      <ExpeditionDetailModal
        expedition={selectedExpedition}
        open={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedExpedition(null);
        }}
      />

      {showDocuments && selectedExpedition && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[90vh] overflow-auto bg-background border rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Documentos - {selectedExpedition.expedition_code}</h2>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowDocuments(false);
                  setSelectedExpedition(null);
                }}
              >
                Fechar
              </Button>
            </div>
            <ExpeditionDocuments />
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a expedição "{expeditionToDelete?.expedition_code}"? 
              Esta ação não pode ser desfeita e todos os dados relacionados serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}