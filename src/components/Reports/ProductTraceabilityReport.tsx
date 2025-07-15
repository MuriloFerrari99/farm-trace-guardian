import React, { useState } from 'react';
import { Search, QrCode, MapPin, Clock, Package, Truck, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const ProductTraceabilityReport = () => {
  const [traceabilityCode, setTraceabilityCode] = useState('');
  const [searchTriggered, setSearchTriggered] = useState(false);

  const { data: traceabilityData, isLoading } = useQuery({
    queryKey: ['traceability', traceabilityCode],
    queryFn: async () => {
      if (!traceabilityCode) return null;

      // Buscar por código de recepção, lote consolidado ou etiqueta
      const queries = await Promise.all([
        // Buscar por código de recepção
        supabase
          .from('receptions')
          .select(`
            *,
            producers(name, ggn, farm_name, certificate_number),
            labels(*),
            lot_movements(
              *,
              storage_locations!from_location_id(location_code, area_id, storage_areas(name)),
              storage_locations!to_location_id(location_code, area_id, storage_areas(name))
            ),
            consolidated_lot_items(
              consolidated_lots(
                *,
                generated_labels(*)
              )
            ),
            expedition_items(
              expeditions(*)
            )
          `)
          .eq('reception_code', traceabilityCode)
          .single(),
        
        // Buscar por código de consolidação
        supabase
          .from('consolidated_lots')
          .select(`
            *,
            consolidated_lot_items(
              quantity_used_kg,
              receptions(
                *,
                producers(name, ggn, farm_name, certificate_number),
                lot_movements(
                  *,
                  storage_locations!from_location_id(location_code, area_id, storage_areas(name)),
                  storage_locations!to_location_id(location_code, area_id, storage_areas(name))
                )
              )
            ),
            generated_labels(*),
            expedition_items(
              expeditions(*)
            )
          `)
          .eq('consolidation_code', traceabilityCode)
          .single()
      ]);

      const reception = queries[0].data;
      const consolidatedLot = queries[1].data;

      return { reception, consolidatedLot };
    },
    enabled: searchTriggered && !!traceabilityCode
  });

  const handleSearch = () => {
    setSearchTriggered(true);
  };

  const renderTimeline = (data: any) => {
    const events = [];

    if (data.reception) {
      // Evento de recepção
      events.push({
        type: 'reception',
        date: data.reception.reception_date,
        title: 'Recebimento',
        description: `Lote ${data.reception.reception_code} recebido`,
        details: {
          producer: data.reception.producers?.name,
          ggn: data.reception.producers?.ggn,
          quantity: data.reception.quantity_kg + ' kg',
          product: data.reception.product_type
        }
      });

      // Eventos de movimentação
      data.reception.lot_movements?.forEach((movement: any) => {
        events.push({
          type: 'movement',
          date: movement.movement_date,
          title: 'Movimentação',
          description: `${movement.movement_type} - ${movement.from_location_id ? 
            movement.storage_locations_from_location_id?.location_code : 'Entrada'} → ${
            movement.storage_locations_to_location_id?.location_code || 'Saída'}`,
          details: {
            type: movement.movement_type,
            location: movement.storage_locations_to_location_id?.storage_areas?.name
          }
        });
      });

      // Evento de consolidação
      if (data.reception.consolidated_lot_items?.length > 0) {
        const consolidation = data.reception.consolidated_lot_items[0].consolidated_lots;
        events.push({
          type: 'consolidation',
          date: consolidation.consolidation_date,
          title: 'Consolidação',
          description: `Lote consolidado ${consolidation.consolidation_code}`,
          details: {
            client: consolidation.client_name,
            total_quantity: consolidation.total_quantity_kg + ' kg'
          }
        });

        // Eventos de etiquetagem
        consolidation.generated_labels?.forEach((label: any) => {
          events.push({
            type: 'labeling',
            date: label.generated_at,
            title: 'Etiquetagem',
            description: `Etiqueta gerada - Layout: ${label.label_layout}`,
            details: {
              qr_code: label.qr_code_data,
              language: label.language
            }
          });
        });
      }

      // Evento de expedição
      if (data.reception.expedition_items?.length > 0) {
        const expedition = data.reception.expedition_items[0].expeditions;
        events.push({
          type: 'expedition',
          date: expedition.expedition_date,
          title: 'Expedição',
          description: `Expedido para ${expedition.destination}`,
          details: {
            transporter: expedition.transporter,
            vehicle: expedition.vehicle_plate,
            weight: expedition.total_weight_kg + ' kg'
          }
        });
      }
    }

    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getEventIcon = (type: string) => {
    const icons = {
      reception: Package,
      movement: MapPin,
      consolidation: Package,
      labeling: Tag,
      expedition: Truck
    };
    return icons[type as keyof typeof icons] || Clock;
  };

  const getEventColor = (type: string) => {
    const colors = {
      reception: 'bg-blue-500',
      movement: 'bg-yellow-500',
      consolidation: 'bg-green-500',
      labeling: 'bg-purple-500',
      expedition: 'bg-red-500'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Busca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Rastreamento de Produto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Digite o código de recepção, consolidação ou QR Code..."
                value={traceabilityCode}
                onChange={(e) => setTraceabilityCode(e.target.value)}
                className="pl-10"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={!traceabilityCode || isLoading}>
              {isLoading ? 'Buscando...' : 'Rastrear'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      {searchTriggered && traceabilityData && (
        <div className="space-y-6">
          {/* Informações do Produto */}
          {traceabilityData.reception && (
            <Card>
              <CardHeader>
                <CardTitle>Informações do Produto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Código de Recepção</label>
                    <p className="font-semibold">{traceabilityData.reception.reception_code}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Produto</label>
                    <p className="font-semibold capitalize">{traceabilityData.reception.product_type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Quantidade</label>
                    <p className="font-semibold">{Number(traceabilityData.reception.quantity_kg).toLocaleString()} kg</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Produtor</label>
                    <p className="font-semibold">{traceabilityData.reception.producers?.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">GGN</label>
                    <p className="font-semibold">{traceabilityData.reception.producers?.ggn}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <Badge variant="default">{traceabilityData.reception.status}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Linha do Tempo */}
          <Card>
            <CardHeader>
              <CardTitle>Linha do Tempo - Rastreabilidade Completa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {renderTimeline(traceabilityData).map((event, index) => (
                  <div key={index} className="flex gap-4 pb-8 relative">
                    {/* Linha vertical */}
                    {index < renderTimeline(traceabilityData).length - 1 && (
                      <div className="absolute left-6 top-12 w-0.5 h-full bg-gray-200" />
                    )}
                    
                    {/* Ícone do evento */}
                    <div className={`w-12 h-12 rounded-full ${getEventColor(event.type)} flex items-center justify-center text-white z-10`}>
                      {React.createElement(getEventIcon(event.type))}
                    </div>
                    
                    {/* Conteúdo do evento */}
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{event.title}</h4>
                          <span className="text-sm text-gray-500">
                            {new Date(event.date).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-3">{event.description}</p>
                        
                        {event.details && (
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {Object.entries(event.details).map(([key, value]) => (
                              <div key={key}>
                                <span className="text-gray-500 capitalize">{key.replace('_', ' ')}: </span>
                                <span className="font-medium">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {searchTriggered && !traceabilityData?.reception && !traceabilityData?.consolidatedLot && !isLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum resultado encontrado</h3>
            <p className="text-gray-600">Verifique o código digitado e tente novamente.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductTraceabilityReport;