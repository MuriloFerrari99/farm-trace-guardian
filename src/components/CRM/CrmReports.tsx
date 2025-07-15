import React from 'react';
import { BarChart3, TrendingUp, Users, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CrmReports = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Relatórios e Indicadores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Relatórios de CRM</h3>
            <p className="text-gray-600">Funcionalidade em desenvolvimento - Métricas de conversão, performance de vendedores e análises de pipeline</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CrmReports;