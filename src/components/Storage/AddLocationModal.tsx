import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useCreateStorageLocation, useStorageAreas } from '@/hooks/useStorage';
import { Plus } from 'lucide-react';

const locationSchema = z.object({
  area_id: z.string().min(1, 'Área é obrigatória'),
  location_code: z.string().min(1, 'Código é obrigatório'),
  capacity_units: z.number().min(1, 'Capacidade deve ser maior que 0'),
  position_x: z.number().min(1).optional(),
  position_y: z.number().min(1).optional(),
});

type LocationFormData = z.infer<typeof locationSchema>;

interface AddLocationModalProps {
  onLocationAdded?: () => void;
}

const AddLocationModal = ({ onLocationAdded }: AddLocationModalProps) => {
  const [open, setOpen] = React.useState(false);
  const createLocation = useCreateStorageLocation();
  const { data: areas = [] } = useStorageAreas();

  const form = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      area_id: '',
      location_code: '',
      capacity_units: 1,
      position_x: 1,
      position_y: 1,
    },
  });

  const onSubmit = async (data: LocationFormData) => {
    const locationData = {
      area_id: data.area_id,
      location_code: data.location_code,
      capacity_units: data.capacity_units,
      position_x: data.position_x,
      position_y: data.position_y,
    };

    createLocation.mutate(locationData, {
      onSuccess: () => {
        form.reset();
        setOpen(false);
        onLocationAdded?.();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center space-x-1">
          <Plus className="h-3 w-3" />
          <span>Nova Localização</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Localização</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="area_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Área de Armazenamento *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma área" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {areas.map((area) => (
                        <SelectItem key={area.id} value={area.id}>
                          {area.name} ({area.area_code})
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
              name="location_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código da Localização *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: A001, B002" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="capacity_units"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacidade (unidades) *</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="position_x"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Posição X</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="position_y"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Posição Y</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createLocation.isPending}
              >
                {createLocation.isPending ? 'Criando...' : 'Criar Localização'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddLocationModal;