import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useCreateStorageChecklist, useStorageLocations } from '@/hooks/useStorage';
import { useReceptions } from '@/hooks/useReceptions';
import { useAuthContext } from '@/contexts/AuthContext';
import { CheckSquare, Camera, Thermometer, Package } from 'lucide-react';

const checklistSchema = z.object({
  reception_id: z.string().min(1, 'Recebimento é obrigatório'),
  location_id: z.string().min(1, 'Localização é obrigatória'),
  temperature_ambient: z.number().min(-50).max(60).optional(),
  pallet_integrity: z.boolean(),
  visual_separation_confirmed: z.boolean(),
  third_party_document: z.string().optional(),
  additional_notes: z.string().optional(),
});

type ChecklistFormData = z.infer<typeof checklistSchema>;

const StorageChecklist = () => {
  const { user } = useAuthContext();
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  
  const createChecklist = useCreateStorageChecklist();
  const { receptions = [] } = useReceptions();
  const { data: locations = [] } = useStorageLocations();

  const form = useForm<ChecklistFormData>({
    resolver: zodResolver(checklistSchema),
    defaultValues: {
      reception_id: '',
      location_id: '',
      temperature_ambient: undefined,
      pallet_integrity: false,
      visual_separation_confirmed: false,
      third_party_document: '',
      additional_notes: '',
    },
  });

  const onSubmit = async (data: ChecklistFormData) => {
    // Para agora, vamos apenas registrar sem upload de fotos
    // Em uma implementação completa, faríamos upload das fotos primeiro
    const checklistData = {
      reception_id: data.reception_id,
      location_id: data.location_id,
      temperature_ambient: data.temperature_ambient || null,
      pallet_integrity: data.pallet_integrity,
      visual_separation_confirmed: data.visual_separation_confirmed,
      third_party_document: data.third_party_document || null,
      additional_notes: data.additional_notes || null,
      checked_by: user?.id || null,
      photos: photoFiles.length > 0 ? { count: photoFiles.length } : null,
    };

    createChecklist.mutate(checklistData, {
      onSuccess: () => {
        form.reset();
        setPhotoFiles([]);
      },
    });
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setPhotoFiles(prev => [...prev, ...files]);
  };

  const removePhoto = (index: number) => {
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
  };

  const approvedReceptions = receptions.filter(r => r.status === 'approved');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CheckSquare className="h-5 w-5" />
          <span>Checklist de Boas Práticas de Armazenamento</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Informações Básicas */}
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
                name="location_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Localização de Armazenamento *</FormLabel>
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
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Verificações de Qualidade */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Thermometer className="h-5 w-5" />
                <span>Verificações de Qualidade</span>
              </h3>

              <FormField
                control={form.control}
                name="temperature_ambient"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temperatura Ambiente (°C)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1"
                        placeholder="Ex: 20.5"
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === '' ? undefined : parseFloat(value));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pallet_integrity"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="flex items-center space-x-2">
                        <Package className="h-4 w-4" />
                        <span>Integridade do Pallet/Embalagem Confirmada</span>
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Verificar se não há danos na embalagem ou pallet
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="visual_separation_confirmed"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Separação Visual Confirmada</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Confirmar que produtos certificados e não certificados estão separados
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Documentação */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="third_party_document"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Documento de Responsabilidade (Armazém Terceirizado)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Número do documento ou referência"
                        {...field}
                      />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      Obrigatório apenas para armazéns terceirizados
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Upload de Fotos */}
              <div className="space-y-2">
                <FormLabel className="flex items-center space-x-2">
                  <Camera className="h-4 w-4" />
                  <span>Fotos de Comprovação</span>
                </FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="cursor-pointer"
                />
                <p className="text-sm text-muted-foreground">
                  Anexe fotos da zona de armazenamento e do pallet com etiqueta visível
                </p>
                
                {photoFiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">{photoFiles.length} foto(s) selecionada(s):</p>
                    <div className="space-y-1">
                      {photoFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <span className="text-sm">{file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removePhoto(index)}
                          >
                            Remover
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <FormField
                control={form.control}
                name="additional_notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações Adicionais</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Observações sobre o armazenamento, condições especiais, etc..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button 
              type="submit" 
              disabled={createChecklist.isPending}
              className="w-full md:w-auto"
            >
              {createChecklist.isPending ? 'Salvando...' : 'Salvar Checklist'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default StorageChecklist;