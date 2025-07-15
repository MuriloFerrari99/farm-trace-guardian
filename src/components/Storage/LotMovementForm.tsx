import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useCreateLotMovement, useStorageLocations } from '@/hooks/useStorage';
import { useReceptions } from '@/hooks/useReceptions';
import { useAuthContext } from '@/contexts/AuthContext';
import { QrCode, MoveRight } from 'lucide-react';

const movementSchema = z.object({
  reception_id: z.string().min(1, 'Recebimento é obrigatório'),
  from_location_id: z.string().optional(),
  to_location_id: z.string().min(1, 'Localização de destino é obrigatória'),
  movement_type: z.enum(['entry', 'internal_move', 'exit']),
  notes: z.string().optional(),
});

type MovementFormData = z.infer<typeof movementSchema>;

const LotMovementForm = () => {
  const { user } = useAuthContext();
  const [qrCodeMode, setQrCodeMode] = useState(false);
  
  const createMovement = useCreateLotMovement();
  const { receptions = [] } = useReceptions();
  const { data: locations = [] } = useStorageLocations();

  const form = useForm<MovementFormData>({
    resolver: zodResolver(movementSchema),
    defaultValues: {
      reception_id: '',
      from_location_id: '',
      to_location_id: '',
      movement_type: 'entry',
      notes: '',
    },
  });

  const onSubmit = async (data: MovementFormData) => {
    const movementData = {
      reception_id: data.reception_id,
      movement_type: data.movement_type,
      to_location_id: data.to_location_id || null,
      from_location_id: data.from_location_id || null,
      notes: data.notes || null,
      moved_by: user?.id || null,
    };

    createMovement.mutate(movementData, {
      onSuccess: () => {
        form.reset();
      },
    });
  };

  const approvedReceptions = receptions.filter(r => r.status === 'approved');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MoveRight className="h-5 w-5" />
          <span>Registrar Movimentação de Lote</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setQrCodeMode(!qrCodeMode)}
            className="ml-auto"
          >
            <QrCode className="h-4 w-4 mr-1" />
            {qrCodeMode ? 'Modo Manual' : 'Modo QR Code'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {qrCodeMode && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <QrCode className="h-4 w-4 inline mr-1" />
              Modo QR Code ativo: Use seu dispositivo para escanear os códigos QR dos lotes e localizações.
            </p>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="reception_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lote (Recebimento) *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o lote" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {approvedReceptions.map((reception) => (
                          <SelectItem key={reception.id} value={reception.id}>
                            {reception.reception_code} - {reception.product_type} 
                            {reception.lot_number && ` (${reception.lot_number})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="movement_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Movimentação *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="entry">Entrada</SelectItem>
                        <SelectItem value="internal_move">Movimentação Interna</SelectItem>
                        <SelectItem value="exit">Saída</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch('movement_type') === 'internal_move' && (
                <FormField
                  control={form.control}
                  name="from_location_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Localização de Origem</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a origem" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {locations.map((location) => (
                            <SelectItem key={location.id} value={location.id}>
                              {location.location_code} - {location.storage_areas?.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="to_location_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {form.watch('movement_type') === 'exit' 
                        ? 'Localização Atual' 
                        : 'Localização de Destino'} *
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a localização" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.location_code} - {location.storage_areas?.name}
                            {location.storage_areas?.zone_type && (
                              <span className="text-xs text-gray-500 ml-1">
                                ({location.storage_areas.zone_type === 'certified' ? 'Certificado' 
                                : location.storage_areas.zone_type === 'non_certified' ? 'Não Certificado'
                                : 'Quarentena'})
                              </span>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Observações sobre a movimentação..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              disabled={createMovement.isPending}
              className="w-full md:w-auto"
            >
              {createMovement.isPending ? 'Registrando...' : 'Registrar Movimentação'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default LotMovementForm;