
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLabels } from '@/hooks/useLabels';
import { QrCode, Printer, Calendar, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const LabelList = () => {
  const { labels, isLoading, updateLabel, deleteLabel } = useLabels();

  const handlePrint = async (labelId: string) => {
    await updateLabel.mutateAsync({
      id: labelId,
      updates: {
        printed_at: new Date().toISOString(),
      },
    });
    
    // Here you would integrate with a printer or generate a PDF
    console.log('Printing label:', labelId);
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
                        disabled={updateLabel.isPending}
                      >
                        <Printer className="h-4 w-4 mr-1" />
                        {label.printed_at ? 'Reimprimir' : 'Imprimir'}
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
