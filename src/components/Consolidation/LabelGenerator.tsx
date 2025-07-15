import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Printer } from 'lucide-react';

const LabelGenerator = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <QrCode className="h-5 w-5" />
          <span>Gerador de Rótulos</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-gray-500">
          <Printer className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Selecione um lote consolidado para gerar rótulos</p>
          <p className="text-sm mt-1">Rótulos personalizados com QR code de rastreabilidade</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LabelGenerator;