
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useReceptions } from '@/hooks/useReceptions';
import { useLabels } from '@/hooks/useLabels';
import { useAuthContext } from '@/contexts/AuthContext';
import { QrCode, Tag } from 'lucide-react';

const LabelForm = () => {
  const [selectedReceptionId, setSelectedReceptionId] = useState('');
  const [labelCode, setLabelCode] = useState('');
  const { receptions, isLoading: receptionsLoading } = useReceptions();
  const { createLabel } = useLabels();
  const { user } = useAuthContext();

  const generateLabelCode = () => {
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    setLabelCode(`LBL-${timestamp}-${random}`);
  };

  const generateQRCode = (receptionCode: string, labelCode: string) => {
    return `https://agrotrace.com/verify/${receptionCode}/${labelCode}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedReceptionId || !labelCode) {
      return;
    }

    const selectedReception = receptions?.find(r => r.id === selectedReceptionId);
    if (!selectedReception) return;

    const qrCodeData = generateQRCode(selectedReception.reception_code, labelCode);

    await createLabel.mutateAsync({
      reception_id: selectedReceptionId,
      label_code: labelCode,
      qr_code: qrCodeData,
      printed_by: user?.id,
    });

    // Reset form
    setSelectedReceptionId('');
    setLabelCode('');
  };

  const approvedReceptions = receptions?.filter(r => r.status === 'approved') || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Tag className="h-5 w-5" />
          <span>Criar Nova Etiqueta</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="reception">Recebimento</Label>
            <Select value={selectedReceptionId} onValueChange={setSelectedReceptionId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um recebimento aprovado" />
              </SelectTrigger>
              <SelectContent>
                {receptionsLoading ? (
                  <SelectItem value="" disabled>Carregando...</SelectItem>
                ) : (
                  approvedReceptions.map((reception) => (
                    <SelectItem key={reception.id} value={reception.id}>
                      {reception.reception_code} - {reception.product_type} - {reception.producer?.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="labelCode">Código da Etiqueta</Label>
            <div className="flex space-x-2">
              <Input
                id="labelCode"
                value={labelCode}
                onChange={(e) => setLabelCode(e.target.value)}
                placeholder="Ex: LBL-20240715-0001"
                required
              />
              <Button
                type="button"
                variant="outline"
                onClick={generateLabelCode}
              >
                Gerar
              </Button>
            </div>
          </div>

          {selectedReceptionId && labelCode && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center space-x-2">
                <QrCode className="h-4 w-4" />
                <span>Preview do QR Code</span>
              </h4>
              <p className="text-sm text-gray-600 break-all">
                {generateQRCode(
                  receptions?.find(r => r.id === selectedReceptionId)?.reception_code || '',
                  labelCode
                )}
              </p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={!selectedReceptionId || !labelCode || createLabel.isPending}
          >
            {createLabel.isPending ? 'Criando...' : 'Criar Etiqueta'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default LabelForm;
