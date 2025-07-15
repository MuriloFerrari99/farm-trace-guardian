import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Eye } from 'lucide-react';

const ConsolidatedLotsList = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Package className="h-5 w-5" />
          <span>Lotes Consolidados</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-gray-500">
          <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum lote consolidado encontrado</p>
          <p className="text-sm mt-1">Crie sua primeira consolidação acima</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConsolidatedLotsList;