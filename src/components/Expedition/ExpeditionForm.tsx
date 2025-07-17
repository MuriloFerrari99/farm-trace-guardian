import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { useExpeditions } from '@/hooks/useExpeditions';
import { useToast } from '@/hooks/use-toast';
import { Truck, Package, CheckCircle2, User, Calendar } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

interface ExpeditionFormData {
  expedition_code: string;
  destination_city: string;
  destination_state: string;
  destination_address: string;
  expedition_date: string;
  transporter: string;
  vehicle_plate: string;
}

interface SelectedConsolidation {
  id: string;
  consolidation_code: string;
  client_name: string;
  product_type: string;
  total_quantity_kg: number;
  consolidated_lot_items: Array<{
    receptions: Tables<'receptions'> & {
      producers: Tables<'producers'>;
    };
  }>;
}

export default function ExpeditionForm() {
  const [availableConsolidations, setAvailableConsolidations] = useState<any[]>([]);
  const [selectedConsolidations, setSelectedConsolidations] = useState<SelectedConsolidation[]>([]);
  const [checklistItems, setChecklistItems] = useState({
    packaging_integrity: false,
    weight_verification: false,
    vehicle_condition: false,
    temperature_check: false,
    documentation_complete: false,
  });
  
  const { createExpedition, getAvailableConsolidations, generateNextExpeditionCode, loading } = useExpeditions();
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm<ExpeditionFormData>();

  useEffect(() => {
    loadAvailableConsolidations();
    // Generate automatic expedition code
    generateNextExpeditionCode().then(code => {
      setValue('expedition_code', code);
    });
  }, []);

  const loadAvailableConsolidations = async () => {
    const consolidations = await getAvailableConsolidations();
    setAvailableConsolidations(consolidations);
  };

  const addConsolidationToExpedition = (consolidation: any) => {
    if (selectedConsolidations.find(item => item.id === consolidation.id)) {
      toast({
        title: "Atenção",
        description: "Esta consolidação já foi adicionada à expedição",
        variant: "destructive",
      });
      return;
    }

    setSelectedConsolidations([...selectedConsolidations, consolidation]);
  };

  const removeConsolidationFromExpedition = (consolidationId: string) => {
    setSelectedConsolidations(selectedConsolidations.filter(item => item.id !== consolidationId));
  };

  const updateChecklistItem = (item: keyof typeof checklistItems, checked: boolean) => {
    setChecklistItems(prev => ({ ...prev, [item]: checked }));
  };

  const isChecklistComplete = Object.values(checklistItems).every(item => item);
  const canSubmit = selectedConsolidations.length > 0 && isChecklistComplete;
  const totalWeight = selectedConsolidations.reduce((sum, consolidation) => sum + consolidation.total_quantity_kg, 0);

  const onSubmit = async (data: ExpeditionFormData) => {
    if (!canSubmit) {
      toast({
        title: "Validação",
        description: "Complete o checklist e adicione pelo menos uma consolidação",
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
        consolidations: selectedConsolidations.map(consolidation => ({
          consolidated_lot_id: consolidation.id,
        })),
      };

      console.log('Creating expedition with data:', expeditionData);
      await createExpedition(expeditionData);
      
      // Reset form
      reset();
      setSelectedConsolidations([]);
      setChecklistItems({
        packaging_integrity: false,
        weight_verification: false,
        vehicle_condition: false,
        temperature_check: false,
        documentation_complete: false,
      });
      
      // Reload available consolidations
      loadAvailableConsolidations();
      
      toast({
        title: "Sucesso",
        description: "Expedição criada com sucesso!",
      });
    } catch (error) {
      console.error('Error creating expedition:', error);
    }
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

      {/* Seleção de Consolidações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Consolidações Disponíveis para Expedição
          </CardTitle>
          <CardDescription>
            Selecione as consolidações que serão enviadas nesta expedição
          </CardDescription>
        </CardHeader>
        <CardContent>
          {availableConsolidations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma consolidação disponível para expedição</p>
              <p className="text-sm mt-1">Crie consolidações primeiro na seção Consolidação</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Quantidade Total</TableHead>
                  <TableHead>Lotes Originais</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {availableConsolidations.map((consolidation) => (
                  <TableRow key={consolidation.id}>
                    <TableCell className="font-medium">{consolidation.consolidation_code}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        {consolidation.client_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{consolidation.product_type}</Badge>
                    </TableCell>
                    <TableCell>{consolidation.total_quantity_kg.toFixed(2)} kg</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {consolidation.consolidated_lot_items?.length || 0} lotes
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {consolidation.consolidation_date 
                          ? new Date(consolidation.consolidation_date).toLocaleDateString('pt-BR')
                          : 'N/A'
                        }
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => addConsolidationToExpedition(consolidation)}
                        disabled={selectedConsolidations.some(item => item.id === consolidation.id)}
                      >
                        {selectedConsolidations.some(item => item.id === consolidation.id) 
                          ? "Selecionada" 
                          : "Adicionar"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Consolidações Selecionadas */}
      {selectedConsolidations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Consolidações na Expedição</CardTitle>
            <CardDescription>
              Total: {totalWeight.toFixed(2)} kg | {selectedConsolidations.length} consolidação(ões) selecionada(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Quantidade (kg)</TableHead>
                  <TableHead>Lotes Originais</TableHead>
                  <TableHead>Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedConsolidations.map((consolidation) => (
                  <TableRow key={consolidation.id}>
                    <TableCell className="font-medium">{consolidation.consolidation_code}</TableCell>
                    <TableCell>{consolidation.client_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{consolidation.product_type}</Badge>
                    </TableCell>
                    <TableCell>{consolidation.total_quantity_kg.toFixed(2)} kg</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {consolidation.consolidated_lot_items?.length || 0} lotes
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeConsolidationFromExpedition(consolidation.id)}
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
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={!canSubmit || loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Criando Expedição...
                  </>
                ) : (
                  'Criar Expedição'
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  reset();
                  setSelectedConsolidations([]);
                  setChecklistItems({
                    packaging_integrity: false,
                    weight_verification: false,
                    vehicle_condition: false,
                    temperature_check: false,
                    documentation_complete: false,
                  });
                }}
              >
                Limpar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}