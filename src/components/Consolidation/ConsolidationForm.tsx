import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Merge, Package, User, Calendar } from 'lucide-react';

const ConsolidationForm = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Merge className="h-5 w-5" />
          <span>Nova Consolidação de Lotes</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Código da Consolidação</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="CONS-2025-001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Cliente</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Nome do cliente"
              />
            </div>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center">
              <Package className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600">Selecione os lotes aprovados para consolidação</p>
              <p className="text-sm text-gray-500 mt-1">
                Apenas lotes com GGN válidos e da mesma variedade podem ser consolidados
              </p>
            </div>
          </div>

          <Button className="w-full">
            <Merge className="h-4 w-4 mr-2" />
            Criar Consolidação
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConsolidationForm;