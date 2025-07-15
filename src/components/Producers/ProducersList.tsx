
import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Edit, Trash2, Phone, Mail, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useProducers, useDeleteProducer } from '@/hooks/useProducers';
import { Database } from '@/integrations/supabase/types';

type Producer = Database['public']['Tables']['producers']['Row'];

export const ProducersList = () => {
  const { producers, isLoading } = useProducers();
  const deleteProducer = useDeleteProducer();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    deleteProducer.mutate(id, {
      onSettled: () => setDeletingId(null),
    });
  };

  const getCertificateStatus = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: 'expired', label: 'Vencido', variant: 'destructive' as const };
    } else if (diffDays <= 30) {
      return { status: 'expiring', label: 'Vencendo', variant: 'secondary' as const };
    } else {
      return { status: 'valid', label: 'Válido', variant: 'default' as const };
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Produtores Cadastrados</CardTitle>
      </CardHeader>
      <CardContent>
        {!producers || producers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhum produtor cadastrado ainda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>GGN</TableHead>
                  <TableHead>Certificado</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {producers.map((producer) => {
                  const certStatus = getCertificateStatus(producer.certificate_expiry);
                  return (
                    <TableRow key={producer.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{producer.name}</div>
                          {producer.address && (
                            <div className="text-sm text-gray-500 flex items-center mt-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              {producer.address}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">{producer.ggn}</TableCell>
                      <TableCell className="font-mono">{producer.certificate_number}</TableCell>
                      <TableCell>
                        {format(new Date(producer.certificate_expiry), 'dd/MM/yyyy', {
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={certStatus.variant}>{certStatus.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {producer.phone && (
                            <div className="text-sm flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {producer.phone}
                            </div>
                          )}
                          {producer.email && (
                            <div className="text-sm flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {producer.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir o produtor "{producer.name}"?
                                  Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(producer.id)}
                                  disabled={deletingId === producer.id}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  {deletingId === producer.id ? 'Excluindo...' : 'Excluir'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
