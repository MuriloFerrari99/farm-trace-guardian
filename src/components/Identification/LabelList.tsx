
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLabels } from '@/hooks/useLabels';
import { QrCode, Printer, Calendar, Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { generateLabelPDF } from '@/utils/labelPrinter';
import { toast } from 'sonner';

const LabelList = () => {
  const { labels, isLoading, updateLabel, deleteLabel } = useLabels();
  const [printingLabelId, setPrintingLabelId] = useState<string | null>(null);

  const handlePrint = async (labelId: string) => {
    const label = labels?.find(l => l.id === labelId);
    if (!label?.reception) {
      toast.error('Dados da etiqueta incompletos');
      return;
    }

    setPrintingLabelId(labelId);
    
    try {
      // Generate and download PDF
      await generateLabelPDF({
        labelCode: label.label_code,
        receptionCode: label.reception.reception_code,
        productType: label.reception.product_type,
        producerName: label.reception.producer?.name || 'N/A',
        quantity: label.reception.quantity_kg,
        receptionDate: format(new Date(label.created_at!), 'dd/MM/yyyy'),
        receptionId: label.reception_id,
      });

      // Update printed status
      await updateLabel.mutateAsync({
        id: labelId,
        updates: {
          printed_at: new Date().toISOString(),
        },
      });

      toast.success('Etiqueta impressa com sucesso!');
    } catch (error) {
      console.error('Erro ao imprimir etiqueta:', error);
      toast.error('Erro ao imprimir etiqueta');
    } finally {
      setPrintingLabelId(null);
    }
  };

  const handleDelete = async (labelId: string) => {
    if (window.confirm('Tem certeza que deseja deletar esta etiqueta?')) {
      await deleteLabel.mutateAsync(labelId);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-500 border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <QrCode className="h-5 w-5" />
          <span>Etiquetas Criadas</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {labels && labels.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código da Etiqueta</TableHead>
                <TableHead>Recebimento</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Produtor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {labels.map((label) => (
                <TableRow key={label.id}>
                  <TableCell className="font-medium">{label.label_code}</TableCell>
                  <TableCell>{label.reception?.reception_code}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {label.reception?.product_type}
                    </Badge>
                  </TableCell>
                  <TableCell>{label.reception?.producer?.name}</TableCell>
                  <TableCell>
                    {label.printed_at ? (
                      <Badge variant="default">Impressa</Badge>
                    ) : (
                      <Badge variant="secondary">Pendente</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>{format(new Date(label.created_at!), 'dd/MM/yyyy')}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePrint(label.id)}
                        disabled={printingLabelId === label.id || updateLabel.isPending}
                      >
                        {printingLabelId === label.id ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Printer className="h-4 w-4 mr-1" />
                        )}
                        {printingLabelId === label.id 
                          ? 'Imprimindo...' 
                          : label.printed_at ? 'Reimprimir' : 'Imprimir'
                        }
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(label.id)}
                        disabled={deleteLabel.isPending}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <QrCode className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhuma etiqueta criada ainda.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LabelList;
