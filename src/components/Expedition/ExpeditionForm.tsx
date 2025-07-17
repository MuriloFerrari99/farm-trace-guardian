import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { useExpeditions } from '@/hooks/useExpeditions';
import { useToast } from '@/hooks/use-toast';
import { Truck, Package, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

interface ExpeditionFormData {
  expedition_code: string;
  destination_city: string;
  destination_state: string;
  destination_address: string;
  expedition_date: string;
  transporter: string;
  vehicle_plate: string;
  driver_name: string;
  container_number: string;
  seal_number: string;
}

interface SelectedLot extends Tables<'receptions'> {
  producers: Tables<'producers'>;
  current_lot_positions: any[];
  selected_quantity: number;
  checklist_completed: boolean;
}

export default function ExpeditionForm() {
  const [availableReceptions, setAvailableReceptions] = useState<any[]>([]);
  const [selectedLots, setSelectedLots] = useState<SelectedLot[]>([]);
  const [checklistItems, setChecklistItems] = useState({
    packaging_integrity: false,
    weight_verification: false,
    vehicle_condition: false,
    temperature_check: false,
    documentation_complete: false,
  });
  
  const { createExpedition, getAvailableReceptions, generateNextExpeditionCode, loading } = useExpeditions();
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ExpeditionFormData>();

  useEffect(() => {
    loadAvailableReceptions();
    // Generate automatic expedition code
    generateNextExpeditionCode().then(code => {
      setValue('expedition_code', code);
    });
  }, []);

  const loadAvailableReceptions = async () => {
    const receptions = await getAvailableReceptions();
    setAvailableReceptions(receptions);
  };

  const addLotToExpedition = (reception: any) => {
    if (selectedLots.find(lot => lot.id === reception.id)) {
      toast({
        title: "Atenção",
        description: "Este lote já foi adicionado à expedição",
        variant: "destructive",
      });
      return;
    }

    const newLot: SelectedLot = {
      ...reception,
      selected_quantity: reception.quantity_kg,
      checklist_completed: false,
    };

    setSelectedLots([...selectedLots, newLot]);
  };

  const removeLotFromExpedition = (lotId: string) => {
    setSelectedLots(selectedLots.filter(lot => lot.id !== lotId));
  };

  const updateLotQuantity = (lotId: string, quantity: number) => {
    setSelectedLots(selectedLots.map(lot => 
      lot.id === lotId ? { ...lot, selected_quantity: quantity } : lot
    ));
  };

  const updateChecklistItem = (item: keyof typeof checklistItems, checked: boolean) => {
    setChecklistItems(prev => ({ ...prev, [item]: checked }));
  };

  const isChecklistComplete = Object.values(checklistItems).every(item => item);
  const canSubmit = selectedLots.length > 0 && isChecklistComplete;
  const totalWeight = selectedLots.reduce((sum, lot) => sum + lot.selected_quantity, 0);

  const onSubmit = async (data: ExpeditionFormData) => {
    if (!canSubmit) {
      toast({
        title: "Validação",
        description: "Complete o checklist e adicione pelo menos um lote",
        variant: "destructive",
      });
      return;
    }

    try {
      // Combine destination fields
      const fullDestination = `${data.destination_city}, ${data.destination_state} - ${data.destination_address}`;
      
      const expeditionData = {
        expedition_code: data.expedition_code,
        destination: fullDestination,
        expedition_date: data.expedition_date,
        total_weight_kg: totalWeight,
        transporter: data.transporter,
        vehicle_plate: data.vehicle_plate,
        items: selectedLots.map(lot => ({
          reception_id: lot.id,
          quantity_kg: lot.selected_quantity,
          lot_reference: lot.lot_number || lot.reception_code,
        })),
      };

      await createExpedition(expeditionData);
      
      // Remove expedited lots from available list
      const expeditedLotIds = selectedLots.map(lot => lot.id);
      setAvailableReceptions(prev => prev.filter(reception => !expeditedLotIds.includes(reception.id)));
      
      // Reset form
      setSelectedLots([]);
      setChecklistItems({
        packaging_integrity: false,
        weight_verification: false,
        vehicle_condition: false,
        temperature_check: false,
        documentation_complete: false,
      });
    } catch (error) {
      console.error('Error creating expedition:', error);
    }
  };

  const getLotStatus = (reception: any) => {
    const hasValidCertificate = reception.producers?.certificate_expiry && 
      new Date(reception.producers.certificate_expiry) > new Date();
    const isLabeled = reception.labels && reception.labels.length > 0;
    const isStored = reception.current_lot_positions && reception.current_lot_positions.length > 0;

    return {
      certified: hasValidCertificate,
      labeled: isLabeled,
      stored: isStored,
      canExpedite: hasValidCertificate && isLabeled && isStored,
    };
  };

  return (
    <div className="space-y-6">
      {/* Checklist de Conferência */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Checklist de Conferência
          </CardTitle>
          <CardDescription>
            Complete todos os itens antes de prosseguir com a expedição
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="packaging_integrity"
                checked={checklistItems.packaging_integrity}
                onCheckedChange={(checked) => updateChecklistItem('packaging_integrity', !!checked)}
              />
              <Label htmlFor="packaging_integrity">Integridade da embalagem verificada</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="weight_verification"
                checked={checklistItems.weight_verification}
                onCheckedChange={(checked) => updateChecklistItem('weight_verification', !!checked)}
              />
              <Label htmlFor="weight_verification">Conferência de peso vs packing list</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="vehicle_condition"
                checked={checklistItems.vehicle_condition}
                onCheckedChange={(checked) => updateChecklistItem('vehicle_condition', !!checked)}
              />
              <Label htmlFor="vehicle_condition">Condição do veículo verificada</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="temperature_check"
                checked={checklistItems.temperature_check}
                onCheckedChange={(checked) => updateChecklistItem('temperature_check', !!checked)}
              />
              <Label htmlFor="temperature_check">Temperatura adequada confirmada</Label>
            </div>
            <div className="flex items-center space-x-2 md:col-span-2">
              <Checkbox
                id="documentation_complete"
                checked={checklistItems.documentation_complete}
                onCheckedChange={(checked) => updateChecklistItem('documentation_complete', !!checked)}
              />
              <Label htmlFor="documentation_complete">Documentação completa e anexada</Label>
            </div>
          </div>
          
          {isChecklistComplete && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Checklist completo. Você pode prosseguir com a expedição.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Seleção de Lotes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Lotes Disponíveis para Expedição
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Produtor</TableHead>
                <TableHead>Quantidade (kg)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {availableReceptions.map((reception) => {
                const status = getLotStatus(reception);
                return (
                  <TableRow key={reception.id}>
                    <TableCell className="font-medium">{reception.reception_code}</TableCell>
                    <TableCell>{reception.product_type}</TableCell>
                    <TableCell>{reception.producers?.name}</TableCell>
                    <TableCell>{reception.quantity_kg}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        <Badge variant={status.certified ? "default" : "destructive"}>
                          {status.certified ? "Certificado" : "Sem Certificado"}
                        </Badge>
                        <Badge variant={status.labeled ? "default" : "secondary"}>
                          {status.labeled ? "Rotulado" : "Não Rotulado"}
                        </Badge>
                        <Badge variant={status.stored ? "default" : "secondary"}>
                          {status.stored ? "Armazenado" : "Não Localizado"}
                        </Badge>
                      </div>
                    </TableCell>
                     <TableCell>
                       <Button
                         size="sm"
                         onClick={() => addLotToExpedition(reception)}
                         disabled={!status.canExpedite || selectedLots.some(lot => lot.id === reception.id)}
                         variant={status.canExpedite ? "default" : "secondary"}
                       >
                         {selectedLots.some(lot => lot.id === reception.id) 
                           ? "Selecionado" 
                           : status.canExpedite ? "Adicionar" : "Não Disponível"}
                       </Button>
                     </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Lotes Selecionados */}
      {selectedLots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Lotes na Expedição</CardTitle>
            <CardDescription>
              Total: {totalWeight.toFixed(2)} kg
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Produtor</TableHead>
                  <TableHead>Quantidade (kg)</TableHead>
                  <TableHead>Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedLots.map((lot) => (
                  <TableRow key={lot.id}>
                    <TableCell className="font-medium">{lot.reception_code}</TableCell>
                    <TableCell>{lot.product_type}</TableCell>
                    <TableCell>{lot.producers?.name}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={lot.selected_quantity}
                        onChange={(e) => updateLotQuantity(lot.id, Number(e.target.value))}
                        max={lot.quantity_kg}
                        min={0}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeLotFromExpedition(lot.id)}
                      >
                        Remover
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Dados da Expedição */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Dados da Expedição
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expedition_code">Código da Expedição *</Label>
                <Input
                  id="expedition_code"
                  {...register('expedition_code', { required: 'Código é obrigatório' })}
                  placeholder="EXP-001"
                />
                {errors.expedition_code && (
                  <p className="text-red-500 text-sm mt-1">{errors.expedition_code.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="expedition_date">Data da Expedição *</Label>
                <Input
                  id="expedition_date"
                  type="date"
                  {...register('expedition_date', { required: 'Data é obrigatória' })}
                />
                {errors.expedition_date && (
                  <p className="text-red-500 text-sm mt-1">{errors.expedition_date.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="destination_city">Cidade *</Label>
                <Input
                  id="destination_city"
                  {...register('destination_city', { required: 'Cidade é obrigatória' })}
                  placeholder="Ex: Santos"
                />
                {errors.destination_city && (
                  <p className="text-red-500 text-sm mt-1">{errors.destination_city.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="destination_state">Estado *</Label>
                <Input
                  id="destination_state"
                  {...register('destination_state', { required: 'Estado é obrigatório' })}
                  placeholder="Ex: SP"
                />
                {errors.destination_state && (
                  <p className="text-red-500 text-sm mt-1">{errors.destination_state.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="destination_address">Destino Final *</Label>
                <Textarea
                  id="destination_address"
                  {...register('destination_address', { required: 'Destino final é obrigatório' })}
                  placeholder="Endereço completo, terminal, porto, etc. (ex: Porto de Santos - Terminal XYZ, Armazém 123)"
                  rows={2}
                />
                {errors.destination_address && (
                  <p className="text-red-500 text-sm mt-1">{errors.destination_address.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="transporter">Transportadora</Label>
                <Input
                  id="transporter"
                  {...register('transporter')}
                  placeholder="Nome da transportadora"
                />
              </div>

              <div>
                <Label htmlFor="vehicle_plate">Placa do Veículo</Label>
                <Input
                  id="vehicle_plate"
                  {...register('vehicle_plate')}
                  placeholder="ABC-1234"
                />
              </div>

              <div>
                <Label htmlFor="driver_name">Nome do Motorista</Label>
                <Input
                  id="driver_name"
                  {...register('driver_name')}
                  placeholder="Nome completo"
                />
              </div>

              <div>
                <Label htmlFor="container_number">Número do Contêiner</Label>
                <Input
                  id="container_number"
                  {...register('container_number')}
                  placeholder="ABCD1234567"
                />
              </div>

              <div>
                <Label htmlFor="seal_number">Número do Lacre</Label>
                <Input
                  id="seal_number"
                  {...register('seal_number')}
                  placeholder="Número do lacre"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-6">
              <Button type="submit" disabled={!canSubmit || loading}>
                {loading ? "Processando..." : "Criar Expedição"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}