import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useReceptions } from '@/hooks/useReceptions';
import { Calendar, Package, User, MapPin, Scale, FileText, QrCode } from 'lucide-react';
import { format } from 'date-fns';

const ReceptionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { receptions = [], isLoading } = useReceptions();
  
  const reception = receptions.find(r => r.id === id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!reception) {
    return <Navigate to="/reception" replace />;
  }

  const getProductTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'tomate': 'Tomate',
      'alface': 'Alface',
      'pepino': 'Pepino',
      'pimentao': 'Pimentão',
      'abacate_hass': 'Abacate Hass',
      'abacate_geada': 'Abacate Geada',
      'abacate_brede': 'Abacate Brede',
      'abacate_margarida': 'Abacate Margarida',
      'manga_tommy': 'Manga Tommy',
      'manga_maca': 'Manga Maçã',
      'manga_palmer': 'Manga Palmer',
      'mel': 'Mel',
      'limao_tahiti': 'Limão Tahiti',
      'outros': 'Outros'
    };
    return labels[type] || type;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'pending': 'Pendente',
      'approved': 'Aprovado',
      'rejected': 'Rejeitado'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center space-x-3 mb-6">
          <QrCode className="h-8 w-8 text-green-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Detalhes do Recebimento</h1>
            <p className="text-gray-600">Visualização completa dos dados do lote</p>
          </div>
        </div>

        {/* Informações Principais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Informações Gerais</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Código do Recebimento</label>
                <p className="text-lg font-mono">{reception.reception_code}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Produto</label>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-sm">
                    {getProductTypeLabel(reception.product_type)}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Quantidade</label>
                <div className="flex items-center space-x-2">
                  <Scale className="h-4 w-4 text-gray-400" />
                  <span className="text-lg">{reception.quantity_kg} kg</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div>
                  <Badge variant={getStatusColor(reception.status || 'pending')}>
                    {getStatusLabel(reception.status || 'pending')}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Produtor</label>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-lg">{reception.producer?.name || 'N/A'}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Data de Recebimento</label>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-lg">
                    {format(new Date(reception.reception_date), 'dd/MM/yyyy')}
                  </span>
                </div>
              </div>

              {reception.harvest_date && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Data de Colheita</label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-lg">
                      {format(new Date(reception.harvest_date), 'dd/MM/yyyy')}
                    </span>
                  </div>
                </div>
              )}

              {reception.lot_number && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Número do Lote</label>
                  <p className="text-lg font-mono">{reception.lot_number}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Observações */}
        {reception.notes && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Observações</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{reception.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Informações do Produtor */}
        {reception.producer && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Informações do Produtor</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Nome</label>
                  <p className="text-lg">{reception.producer.name}</p>
                </div>

                {reception.producer.farm_name && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Fazenda</label>
                    <p className="text-lg">{reception.producer.farm_name}</p>
                  </div>
                )}

                {reception.producer.email && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">E-mail</label>
                    <p className="text-lg">{reception.producer.email}</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {reception.producer.phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Telefone</label>
                    <p className="text-lg">{reception.producer.phone}</p>
                  </div>
                )}

                {reception.producer.certificate_number && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Certificado</label>
                    <p className="text-lg font-mono">{reception.producer.certificate_number}</p>
                  </div>
                )}

                {reception.producer.ggn && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">GGN</label>
                    <p className="text-lg font-mono">{reception.producer.ggn}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ReceptionDetails;