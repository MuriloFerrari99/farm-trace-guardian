import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStorageAreas, useCurrentLotPositions } from '@/hooks/useStorage';
import { MapPin, Package, AlertTriangle } from 'lucide-react';

const StorageMap = () => {
  const { data: storageAreas = [], isLoading: areasLoading } = useStorageAreas();
  const { data: currentPositions = [], isLoading: positionsLoading } = useCurrentLotPositions();

  const getZoneColor = (zoneType: string) => {
    switch (zoneType) {
      case 'certified': return 'bg-green-100 border-green-300 text-green-800';
      case 'non_certified': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'quarantine': return 'bg-red-100 border-red-300 text-red-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getZoneIcon = (zoneType: string) => {
    switch (zoneType) {
      case 'certified': return <Package className="h-4 w-4" />;
      case 'non_certified': return <MapPin className="h-4 w-4" />;
      case 'quarantine': return <AlertTriangle className="h-4 w-4" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  const getZoneLabel = (zoneType: string) => {
    switch (zoneType) {
      case 'certified': return 'Certificados';
      case 'non_certified': return 'Não Certificados';
      case 'quarantine': return 'Quarentena';
      default: return 'Geral';
    }
  };

  const getLotsInArea = (areaId: string) => {
    // Temporariamente simplificado - implementação completa após ajustar tipos
    return currentPositions.filter(position => {
      // Buscar pela área de armazenamento do lote
      return position.current_location_id !== null;
    });
  };

  if (areasLoading || positionsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mapeamento Digital do Armazém</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="h-5 w-5" />
          <span>Mapeamento Digital do Armazém</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {storageAreas.map((area) => {
            const lotsInArea = getLotsInArea(area.id);
            const occupancyPercentage = area.capacity_kg 
              ? ((area.current_stock_kg || 0) / area.capacity_kg * 100)
              : 0;

            return (
              <Card 
                key={area.id} 
                className={`border-2 ${getZoneColor(area.zone_type || 'default')}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getZoneIcon(area.zone_type || 'default')}
                      <span className="font-semibold">{area.name}</span>
                    </div>
                    <Badge variant="outline">
                      {getZoneLabel(area.zone_type || 'default')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Código:</span>
                      <span className="font-mono">{area.area_code}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Lotes:</span>
                      <span className="font-semibold">{lotsInArea.length}</span>
                    </div>

                    {area.capacity_kg && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Ocupação:</span>
                          <span>{occupancyPercentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(occupancyPercentage, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>{area.current_stock_kg || 0} kg</span>
                          <span>{area.capacity_kg} kg</span>
                        </div>
                      </div>
                    )}

                    {area.is_certified && (
                      <Badge variant="secondary" className="text-xs">
                        Área Certificada
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {storageAreas.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma área de armazenamento configurada</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StorageMap;