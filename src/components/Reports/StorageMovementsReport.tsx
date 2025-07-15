import React, { useState } from 'react';
import { MapPin, Clock, AlertTriangle, Download, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const StorageMovementsReport = () => {
  const [filterMovementType, setFilterMovementType] = useState('');
  const [filterLocation, setFilterLocation] = useState('');

  const { data: movements } = useQuery({
    queryKey: ['storage-movements-report', filterMovementType, filterLocation],
    queryFn: async () => {
      let query = supabase
        .from('lot_movements')
        .select(`
          *,
          receptions(
            reception_code,
            product_type,
            quantity_kg,
            producers(name, ggn)
          ),
          from_location:storage_locations!from_location_id(
            location_code,
            storage_areas(name, area_code)
          ),
          to_location:storage_locations!to_location_id(
            location_code,
            storage_areas(name, area_code)
          ),
          profiles!moved_by(name)
        `)
        .order('movement_date', { ascending: false });

      if (filterMovementType) {
        query = query.eq('movement_type', filterMovementType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const { data: storageAreas } = useQuery({
    queryKey: ['storage-areas-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('storage_areas')
        .select('*')
        .eq('is_active', true);
      if (error) throw error;
      return data;
    }
  });

  const { data: currentPositions } = useQuery({
    queryKey: ['current-positions-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('current_lot_positions')
        .select(`
          *,
          receptions(
            reception_code,
            product_type,
            quantity_kg,
            producers(name)
          ),
          storage_locations(
            location_code,
            storage_areas(name, area_code)
          )
        `);
      if (error) throw error;
      return data;
    }
  });

  const filteredMovements = movements?.filter(movement => {
    if (filterLocation) {
      const fromArea = movement.from_location?.storage_areas?.area_code;
      const toArea = movement.to_location?.storage_areas?.area_code;
      const selectedArea = storageAreas?.find(a => a.id === filterLocation)?.area_code;
      return fromArea === selectedArea || toArea === selectedArea;
    }
    return true;
  }) || [];

  const getMovementTypeBadge = (type: string) => {
    const typeMap = {
      entrada: { label: 'Entrada', variant: 'default' as const },
      saida: { label: 'Saída', variant: 'secondary' as const },
      transferencia: { label: 'Transferência', variant: 'outline' as const },
      consolidacao: { label: 'Consolidação', variant: 'destructive' as const }
    };
    const config = typeMap[type as keyof typeof typeMap] || { label: type, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const calculateStorageTime = (entryDate: string) => {
    const entry = new Date(entryDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - entry.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStorageAlert = (days: number) => {
    if (days > 30) return { level: 'high', message: 'Estoque antigo (>30 dias)' };
    if (days > 15) return { level: 'medium', message: 'Atenção (>15 dias)' };
    return { level: 'low', message: 'Normal' };
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Movimentação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo de Movimentação</label>
              <Select value={filterMovementType} onValueChange={setFilterMovementType}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os tipos</SelectItem>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="saida">Saída</SelectItem>
                  <SelectItem value="transferencia">Transferência</SelectItem>
                  <SelectItem value="consolidacao">Consolidação</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Área de Armazenamento</label>
              <Select value={filterLocation} onValueChange={setFilterLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as áreas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as áreas</SelectItem>
                  {storageAreas?.map(area => (
                    <SelectItem key={area.id} value={area.id}>
                      {area.area_code} - {area.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Exportar Relatório
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo das Posições Atuais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Posições Atuais dos Lotes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código do Lote</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Produtor</TableHead>
                <TableHead>Localização Atual</TableHead>
                <TableHead>Tempo em Estoque</TableHead>
                <TableHead>Alerta</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentPositions?.map((position) => {
                const storageTime = calculateStorageTime(position.entry_date);
                const alert = getStorageAlert(storageTime);
                
                return (
                  <TableRow key={position.id}>
                    <TableCell className="font-medium">
                      {position.receptions?.reception_code}
                    </TableCell>
                    <TableCell className="capitalize">
                      {position.receptions?.product_type}
                    </TableCell>
                    <TableCell>
                      {position.receptions?.producers?.name}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {position.storage_locations?.storage_areas?.area_code}
                        </div>
                        <div className="text-sm text-gray-500">
                          Posição: {position.storage_locations?.location_code}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{storageTime} dias</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {alert.level === 'high' && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                        {alert.level === 'medium' && (
                          <Clock className="h-4 w-4 text-yellow-500" />
                        )}
                        <span className={`text-sm ${
                          alert.level === 'high' ? 'text-red-600' :
                          alert.level === 'medium' ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {alert.message}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Histórico de Movimentações */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Movimentações</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Lote</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Observações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMovements.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell>
                    {movement.movement_date ? 
                      new Date(movement.movement_date).toLocaleString('pt-BR') : 
                      '-'
                    }
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {movement.receptions?.reception_code}
                      </div>
                      <div className="text-sm text-gray-500">
                        {movement.receptions?.producers?.name}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getMovementTypeBadge(movement.movement_type)}
                  </TableCell>
                  <TableCell>
                    {movement.from_location ? (
                      <div>
                        <div className="font-medium">
                          {movement.from_location.storage_areas?.area_code}
                        </div>
                        <div className="text-sm text-gray-500">
                          {movement.from_location.location_code}
                        </div>
                      </div>
                    ) : (
                      <Badge variant="outline">Entrada</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {movement.to_location ? (
                      <div>
                        <div className="font-medium">
                          {movement.to_location.storage_areas?.area_code}
                        </div>
                        <div className="text-sm text-gray-500">
                          {movement.to_location.location_code}
                        </div>
                      </div>
                    ) : (
                      <Badge variant="outline">Saída</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {movement.profiles?.name || '-'}
                  </TableCell>
                  <TableCell>
                    {movement.notes || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default StorageMovementsReport;