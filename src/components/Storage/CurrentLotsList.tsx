import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCurrentLotPositions } from '@/hooks/useStorage';
import { Package, MapPin, Calendar, User, QrCode } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const CurrentLotsList = () => {
  const { data: currentPositions = [], isLoading } = useCurrentLotPositions();

  const getZoneBadgeVariant = (zoneType: string) => {
    switch (zoneType) {
      case 'certified': return 'default';
      case 'non_certified': return 'secondary';
      case 'quarantine': return 'destructive';
      default: return 'outline';
    }
  };

  const getZoneLabel = (zoneType: string) => {
    switch (zoneType) {
      case 'certified': return 'Certificado';
      case 'non_certified': return 'Não Certificado';
      case 'quarantine': return 'Quarentena';
      default: return 'Geral';
    }
  };

  const handleGenerateQR = (receptionCode: string) => {
    // Em uma implementação completa, isso geraria um QR code
    alert(`QR Code para o lote: ${receptionCode}`);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lotes Atualmente Armazenados</CardTitle>
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
          <Package className="h-5 w-5" />
          <span>Lotes Atualmente Armazenados</span>
          <Badge variant="outline" className="ml-auto">
            {currentPositions.length} lotes
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {currentPositions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum lote armazenado no momento</p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentPositions.map((position) => (
              <Card key={position.id} className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">
                          {position.receptions?.reception_code}
                        </h3>
                        <Badge variant="outline">
                          {position.receptions?.product_type}
                        </Badge>
                        <Badge 
                          variant={getZoneBadgeVariant(
                            position.storage_locations?.storage_areas?.zone_type || ''
                          )}
                        >
                          {getZoneLabel(
                            position.storage_locations?.storage_areas?.zone_type || ''
                          )}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>Produtor:</span>
                          <span className="font-medium">
                            {position.receptions?.producers?.name}
                          </span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <Package className="h-3 w-3" />
                          <span>Quantidade:</span>
                          <span className="font-medium">
                            {position.receptions?.quantity_kg} kg
                          </span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>Localização:</span>
                          <span className="font-medium">
                            {position.storage_locations?.location_code}
                          </span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>Entrada:</span>
                          <span className="font-medium">
                            {format(new Date(position.entry_date), 'dd/MM/yyyy', { locale: ptBR })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <MapPin className="h-3 w-3" />
                        <span>Área:</span>
                        <span className="font-medium">
                          {position.storage_locations?.storage_areas?.name}
                        </span>
                      </div>

                      {position.receptions?.lot_number && (
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <span>Lote:</span>
                          <span className="font-medium font-mono">
                            {position.receptions.lot_number}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleGenerateQR(position.receptions?.reception_code || '')}
                      >
                        <QrCode className="h-4 w-4 mr-1" />
                        QR Code
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CurrentLotsList;