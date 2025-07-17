import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calculator, DollarSign, Package, Truck } from 'lucide-react';

interface ProposalData {
  product_name: string;
  product_description: string;
  unit_price: number;
  currency: 'USD' | 'EUR' | 'BRL';
  incoterm: 'FOB' | 'CFR' | 'CIF';
  exchange_rate: number;
  total_weight_kg: number;
  package_weight_kg: number;
  packages_per_container: number;
  containers_quantity: number;
  freight_cost: number;
  insurance_cost: number;
  port_of_loading: string;
  port_of_discharge: string;
  delivery_time_days: number;
  payment_terms: string;
  validity_days: number;
  certifications: string[];
  exporter_name: string;
  exporter_contact: string;
  exporter_email: string;
  notes: string;
  shipping_format: string;
  co2_range_min: number;
  co2_range_max: number;
  o2_range_min: number;
  o2_range_max: number;
  container_sealed: boolean;
  temperature_min: number;
  temperature_max: number;
}

interface ProposalCalculatorProps {
  onSubmit: (data: ProposalData) => void;
  initialData?: Partial<ProposalData>;
  loading?: boolean;
}

const ProposalCalculator: React.FC<ProposalCalculatorProps> = ({
  onSubmit,
  initialData,
  loading = false
}) => {
  const [formData, setFormData] = useState<ProposalData>({
    product_name: '',
    product_description: '',
    unit_price: 0,
    currency: 'USD',
    incoterm: 'FOB',
    exchange_rate: 5.50,
    total_weight_kg: 0,
    package_weight_kg: 10,
    packages_per_container: 120,
    containers_quantity: 1,
    freight_cost: 0,
    insurance_cost: 0,
    port_of_loading: 'Santos',
    port_of_discharge: '',
    delivery_time_days: 21,
    payment_terms: '50% advance / 50% arrived',
    validity_days: 5,
    certifications: [],
    exporter_name: 'Pé Doce',
    exporter_contact: 'murilo@pedoce.com.br',
    exporter_email: 'murilo@pedoce.com.br',
    notes: '',
    shipping_format: 'A mercadoria será acondicionada em caixas plásticas ventiladas com capacidade de 10 kg, padronizadas para transporte internacional. Cada pallet conterá 120 caixas, totalizando 1.200 kg por pallet. Sendo enviado através de um Reefer 40 pés com temperaturas e outras variáveis controladas.',
    co2_range_min: 3,
    co2_range_max: 10,
    o2_range_min: 2,
    o2_range_max: 5,
    container_sealed: true,
    temperature_min: 5,
    temperature_max: 7,
    ...initialData
  });

  const [calculations, setCalculations] = useState({
    totalValue: 0,
    totalValueBRL: 0,
    finalValue: 0
  });

  // Calculate values when form data changes
  useEffect(() => {
    const totalValue = formData.total_weight_kg * formData.unit_price;
    const totalValueBRL = totalValue * formData.exchange_rate;
    
    let finalValue = totalValue;
    if (formData.incoterm === 'CFR' || formData.incoterm === 'CIF') {
      finalValue += formData.freight_cost;
    }
    if (formData.incoterm === 'CIF') {
      finalValue += formData.insurance_cost;
    }

    setCalculations({
      totalValue,
      totalValueBRL,
      finalValue
    });
  }, [formData]);

  const handleInputChange = (field: keyof ProposalData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCertificationChange = (cert: string) => {
    const current = formData.certifications;
    if (current.includes(cert)) {
      handleInputChange('certifications', current.filter(c => c !== cert));
    } else {
      handleInputChange('certifications', [...current, cert]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Product Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Informações do Produto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="product_name">Nome do Produto</Label>
              <Input
                id="product_name"
                value={formData.product_name}
                onChange={(e) => handleInputChange('product_name', e.target.value)}
                placeholder="Ex: Hass Avocado - Organic"
                required
              />
            </div>
            <div>
              <Label>Certificações</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {['Phytosanitary', 'Organic', 'Traceability', 'GLOBALG.A.P.', 'Fair Trade'].map(cert => (
                  <Badge
                    key={cert}
                    variant={formData.certifications.includes(cert) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleCertificationChange(cert)}
                  >
                    {cert}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <div>
            <Label htmlFor="product_description">Descrição</Label>
            <Textarea
              id="product_description"
              value={formData.product_description}
              onChange={(e) => handleInputChange('product_description', e.target.value)}
              placeholder="Descrição detalhada do produto..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Pricing and Terms */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Preços e Condições
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="unit_price">Preço por Kg</Label>
              <Input
                id="unit_price"
                type="number"
                step="0.01"
                value={formData.unit_price || ''}
                onChange={(e) => handleInputChange('unit_price', e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                required
              />
            </div>
            <div>
              <Label>Moeda</Label>
              <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="BRL">BRL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Incoterm</Label>
              <Select value={formData.incoterm} onValueChange={(value) => handleInputChange('incoterm', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FOB">FOB</SelectItem>
                  <SelectItem value="CFR">CFR</SelectItem>
                  <SelectItem value="CIF">CIF</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="exchange_rate">Taxa de Câmbio</Label>
              <Input
                id="exchange_rate"
                type="number"
                step="0.0001"
                value={formData.exchange_rate || ''}
                onChange={(e) => handleInputChange('exchange_rate', e.target.value === '' ? '' : parseFloat(e.target.value) || 1)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="payment_terms">Condições de Pagamento</Label>
              <Input
                id="payment_terms"
                value={formData.payment_terms}
                onChange={(e) => handleInputChange('payment_terms', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="delivery_time_days">Prazo de Entrega (dias)</Label>
              <Input
                id="delivery_time_days"
                type="number"
                value={formData.delivery_time_days || ''}
                onChange={(e) => handleInputChange('delivery_time_days', e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="validity_days">Validade da Proposta (dias)</Label>
              <Input
                id="validity_days"
                type="number"
                value={formData.validity_days || ''}
                onChange={(e) => handleInputChange('validity_days', e.target.value === '' ? '' : parseInt(e.target.value) || 30)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Volume and Packaging */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Volume e Embalagem
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="total_weight_kg">Peso Total (kg)</Label>
              <Input
                id="total_weight_kg"
                type="number"
                step="0.1"
                value={formData.total_weight_kg || ''}
                onChange={(e) => handleInputChange('total_weight_kg', e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                required
              />
            </div>
            <div>
              <Label htmlFor="package_weight_kg">Peso por Embalagem (kg)</Label>
              <Input
                id="package_weight_kg"
                type="number"
                step="0.1"
                value={formData.package_weight_kg || ''}
                onChange={(e) => handleInputChange('package_weight_kg', e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                required
              />
            </div>
            <div>
              <Label htmlFor="packages_per_container">Embalagens por Container</Label>
              <Input
                id="packages_per_container"
                type="number"
                value={formData.packages_per_container || ''}
                onChange={(e) => handleInputChange('packages_per_container', e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                required
              />
            </div>
            <div>
              <Label htmlFor="containers_quantity">Número de Containers</Label>
              <Input
                id="containers_quantity"
                type="number"
                value={formData.containers_quantity || ''}
                onChange={(e) => handleInputChange('containers_quantity', e.target.value === '' ? '' : parseInt(e.target.value) || 1)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="shipping_format">Formato de Envio</Label>
            <Textarea
              id="shipping_format"
              value={formData.shipping_format}
              onChange={(e) => handleInputChange('shipping_format', e.target.value)}
              placeholder="Caixas plásticas de 10kg: 120 caixas por pallet, 20 pallets por Container"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Technical Specifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Especificações Técnicas de Transporte
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Atmospheric Specifications */}
            <div className="space-y-4">
              <h4 className="font-semibold text-muted-foreground">Especificações Atmosféricas</h4>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Concentração de CO₂ (%)</Label>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex-1">
                      <Input
                        type="number"
                        value={formData.co2_range_min || ''}
                        onChange={(e) => handleInputChange('co2_range_min', e.target.value ? Number(e.target.value) : 3)}
                        placeholder="Mín"
                        step="0.1"
                        className="text-center"
                      />
                      <span className="text-xs text-muted-foreground block mt-1">Mínimo</span>
                    </div>
                    <span className="text-muted-foreground font-medium">até</span>
                    <div className="flex-1">
                      <Input
                        type="number"
                        value={formData.co2_range_max || ''}
                        onChange={(e) => handleInputChange('co2_range_max', e.target.value ? Number(e.target.value) : 10)}
                        placeholder="Máx"
                        step="0.1"
                        className="text-center"
                      />
                      <span className="text-xs text-muted-foreground block mt-1">Máximo</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Concentração de O₂ (%)</Label>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex-1">
                      <Input
                        type="number"
                        value={formData.o2_range_min || ''}
                        onChange={(e) => handleInputChange('o2_range_min', e.target.value ? Number(e.target.value) : 2)}
                        placeholder="Mín"
                        step="0.1"
                        className="text-center"
                      />
                      <span className="text-xs text-muted-foreground block mt-1">Mínimo</span>
                    </div>
                    <span className="text-muted-foreground font-medium">até</span>
                    <div className="flex-1">
                      <Input
                        type="number"
                        value={formData.o2_range_max || ''}
                        onChange={(e) => handleInputChange('o2_range_max', e.target.value ? Number(e.target.value) : 5)}
                        placeholder="Máx"
                        step="0.1"
                        className="text-center"
                      />
                      <span className="text-xs text-muted-foreground block mt-1">Máximo</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Temperature and Container Specifications */}
            <div className="space-y-4">
              <h4 className="font-semibold text-muted-foreground">Condições de Transporte</h4>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Temperatura de Transporte (°C)</Label>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex-1">
                      <Input
                        type="number"
                        value={formData.temperature_min || ''}
                        onChange={(e) => handleInputChange('temperature_min', e.target.value ? Number(e.target.value) : 5)}
                        placeholder="Mín"
                        step="0.1"
                        className="text-center"
                      />
                      <span className="text-xs text-muted-foreground block mt-1">Mínimo</span>
                    </div>
                    <span className="text-muted-foreground font-medium">até</span>
                    <div className="flex-1">
                      <Input
                        type="number"
                        value={formData.temperature_max || ''}
                        onChange={(e) => handleInputChange('temperature_max', e.target.value ? Number(e.target.value) : 7)}
                        placeholder="Máx"
                        step="0.1"
                        className="text-center"
                      />
                      <span className="text-xs text-muted-foreground block mt-1">Máximo</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
                  <input
                    type="checkbox"
                    id="container_sealed"
                    checked={formData.container_sealed}
                    onChange={(e) => handleInputChange('container_sealed', e.target.checked)}
                    className="mt-1 rounded border-border"
                  />
                  <div className="flex-1">
                    <Label htmlFor="container_sealed" className="text-sm font-medium cursor-pointer">
                      Válvulas e drenos do container lacrados
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Container será enviado com sistema de ventilação controlada
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipping Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Detalhes de Transporte
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="port_of_loading">Porto de Embarque</Label>
              <Input
                id="port_of_loading"
                value={formData.port_of_loading}
                onChange={(e) => handleInputChange('port_of_loading', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="port_of_discharge">Porto de Desembarque</Label>
              <Input
                id="port_of_discharge"
                value={formData.port_of_discharge}
                onChange={(e) => handleInputChange('port_of_discharge', e.target.value)}
              />
            </div>
          </div>

          {(formData.incoterm === 'CFR' || formData.incoterm === 'CIF') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="freight_cost">Custo do Frete ({formData.currency})</Label>
                <Input
                  id="freight_cost"
                  type="number"
                  step="0.01"
                  value={formData.freight_cost || ''}
                  onChange={(e) => handleInputChange('freight_cost', e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                />
              </div>
              {formData.incoterm === 'CIF' && (
                <div>
                  <Label htmlFor="insurance_cost">Custo do Seguro ({formData.currency})</Label>
                  <Input
                    id="insurance_cost"
                    type="number"
                    step="0.01"
                    value={formData.insurance_cost || ''}
                    onChange={(e) => handleInputChange('insurance_cost', e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Calculations Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Resumo dos Cálculos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {formData.currency} {calculations.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-muted-foreground">Valor Base ({formData.incoterm})</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {formData.currency} {calculations.finalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-muted-foreground">Valor Final</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">
                R$ {calculations.totalValueBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-muted-foreground">Valor em BRL</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Observações Adicionais</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Observações adicionais sobre a proposta..."
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={loading}>
          {loading ? 'Gerando Proposta...' : 'Gerar Proposta'}
        </Button>
      </div>
    </form>
  );
};

export default ProposalCalculator;