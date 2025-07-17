import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { QrCode, Printer, Package, Plus, X } from 'lucide-react';
import { useConsolidation } from '@/hooks/useConsolidation';
import { useConsolidationLabels } from '@/hooks/useConsolidationLabels';
import { toast } from 'sonner';

const LabelGenerator = () => {
  const { consolidatedLots, isLoading } = useConsolidation();
  const { createLabel } = useConsolidationLabels();
  
  const [selectedConsolidation, setSelectedConsolidation] = useState<string>('');
  const [labelData, setLabelData] = useState({
    importer_name: '',
    po_number: '',
    volume_quantity: 1,
    origin_country: 'Brasil',
    destination_country: '',
    tracking_code: '',
    extra_labels: [] as string[],
    logistics_instructions: '',
    language: 'pt-BR'
  });
  const [newExtraLabel, setNewExtraLabel] = useState('');

  const commonExtraLabels = [
    'FRÁGIL',
    'KEEP COOL',
    'THIS SIDE UP',
    'ORGANIC',
    'FRESH PRODUCE',
    'PERISHABLE'
  ];

  const handleAddExtraLabel = (label: string) => {
    if (!labelData.extra_labels.includes(label)) {
      setLabelData({
        ...labelData,
        extra_labels: [...labelData.extra_labels, label]
      });
    }
    setNewExtraLabel('');
  };

  const handleRemoveExtraLabel = (index: number) => {
    setLabelData({
      ...labelData,
      extra_labels: labelData.extra_labels.filter((_, i) => i !== index)
    });
  };

  const handleGenerateLabel = async () => {
    if (!selectedConsolidation) {
      toast.error('Selecione uma consolidação');
      return;
    }

    if (!labelData.importer_name || !labelData.po_number || !labelData.destination_country) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    // Gerar código de rastreamento automático se não fornecido
    const trackingCode = labelData.tracking_code || `TRK-${Date.now().toString(36).toUpperCase()}`;

    await createLabel.mutateAsync({
      consolidated_lot_id: selectedConsolidation,
      ...labelData,
      product_type: selectedConsolidationData?.product_type || '',
      tracking_code: trackingCode
    });
  };

  const selectedConsolidationData = consolidatedLots?.find(c => c.id === selectedConsolidation);

  return (
    <div className="space-y-6">
      {/* Seleção de Consolidação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Selecionar Consolidação</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Carregando consolidações...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <Select value={selectedConsolidation} onValueChange={setSelectedConsolidation}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma consolidação" />
                </SelectTrigger>
                <SelectContent>
                  {consolidatedLots?.map((consolidation) => (
                    <SelectItem key={consolidation.id} value={consolidation.id}>
                      {consolidation.consolidation_code} - {consolidation.client_name} - {consolidation.product_type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedConsolidationData && (
                <div className="bg-muted p-4 rounded-md space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Cliente:</span>
                    <span>{selectedConsolidationData.client_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Produto:</span>
                    <Badge variant="outline">{selectedConsolidationData.product_type}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Quantidade:</span>
                    <span>{selectedConsolidationData.total_quantity_kg.toFixed(2)} kg</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formulário de Rótulo */}
      {selectedConsolidation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <QrCode className="h-5 w-5" />
              <span>Informações do Rótulo</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="importer">Nome do Importador/Destinatário *</Label>
                <Input
                  id="importer"
                  value={labelData.importer_name}
                  onChange={(e) => setLabelData({...labelData, importer_name: e.target.value})}
                  placeholder="Nome da empresa importadora"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="po">Número do Pedido (PO/Invoice) *</Label>
                <Input
                  id="po"
                  value={labelData.po_number}
                  onChange={(e) => setLabelData({...labelData, po_number: e.target.value})}
                  placeholder="PO-2024-001"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="volumes">Quantidade de Volumes</Label>
                <Input
                  id="volumes"
                  type="number"
                  min="1"
                  value={labelData.volume_quantity}
                  onChange={(e) => setLabelData({...labelData, volume_quantity: parseInt(e.target.value) || 1})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="origin">País de Origem</Label>
                <Input
                  id="origin"
                  value={labelData.origin_country}
                  onChange={(e) => setLabelData({...labelData, origin_country: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="destination">País de Destino *</Label>
                <Input
                  id="destination"
                  value={labelData.destination_country}
                  onChange={(e) => setLabelData({...labelData, destination_country: e.target.value})}
                  placeholder="Estados Unidos"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tracking">Código de Rastreamento</Label>
              <Input
                id="tracking"
                value={labelData.tracking_code}
                onChange={(e) => setLabelData({...labelData, tracking_code: e.target.value})}
                placeholder="Deixe vazio para gerar automaticamente"
              />
            </div>

            {/* Etiquetas Extras */}
            <div className="space-y-4">
              <Label>Etiquetas Extras</Label>
              
              <div className="flex flex-wrap gap-2">
                {commonExtraLabels.map((label) => (
                  <Button
                    key={label}
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddExtraLabel(label)}
                    disabled={labelData.extra_labels.includes(label)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {label}
                  </Button>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Input
                  value={newExtraLabel}
                  onChange={(e) => setNewExtraLabel(e.target.value)}
                  placeholder="Etiqueta personalizada"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newExtraLabel.trim()) {
                      handleAddExtraLabel(newExtraLabel.trim().toUpperCase());
                    }
                  }}
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    if (newExtraLabel.trim()) {
                      handleAddExtraLabel(newExtraLabel.trim().toUpperCase());
                    }
                  }}
                >
                  Adicionar
                </Button>
              </div>
              
              {labelData.extra_labels.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {labelData.extra_labels.map((label, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {label}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 hover:bg-transparent"
                        onClick={() => handleRemoveExtraLabel(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">Instruções Logísticas Específicas</Label>
              <Textarea
                id="instructions"
                value={labelData.logistics_instructions}
                onChange={(e) => setLabelData({...labelData, logistics_instructions: e.target.value})}
                placeholder="Instruções especiais de manuseio, temperatura, etc."
                rows={3}
              />
            </div>

            <Button 
              onClick={handleGenerateLabel}
              disabled={createLabel.isPending}
              className="w-full"
            >
              <Printer className="h-4 w-4 mr-2" />
              {createLabel.isPending ? 'Gerando Rótulo...' : 'Gerar e Baixar Rótulo'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LabelGenerator;