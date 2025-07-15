import React from 'react';
import { FileText, TrendingUp, Package, Warehouse, Truck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductReceptionReport from '@/components/Reports/ProductReceptionReport';
import ConsolidatedLotsReport from '@/components/Reports/ConsolidatedLotsReport';
import ProductTraceabilityReport from '@/components/Reports/ProductTraceabilityReport';
import StorageMovementsReport from '@/components/Reports/StorageMovementsReport';
import ExpeditionReport from '@/components/Reports/ExpeditionReport';

const Reports = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <FileText className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios Operacionais</h1>
          <p className="text-gray-600">Análises e rastreabilidade completa do sistema</p>
        </div>
      </div>

      <Tabs defaultValue="reception" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="reception" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Entrada de Produtos
          </TabsTrigger>
          <TabsTrigger value="consolidated" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Lotes Consolidados
          </TabsTrigger>
          <TabsTrigger value="traceability" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Rastreamento
          </TabsTrigger>
          <TabsTrigger value="storage" className="flex items-center gap-2">
            <Warehouse className="h-4 w-4" />
            Movimentações
          </TabsTrigger>
          <TabsTrigger value="expedition" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Expedições
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reception">
          <ProductReceptionReport />
        </TabsContent>

        <TabsContent value="consolidated">
          <ConsolidatedLotsReport />
        </TabsContent>

        <TabsContent value="traceability">
          <ProductTraceabilityReport />
        </TabsContent>

        <TabsContent value="storage">
          <StorageMovementsReport />
        </TabsContent>

        <TabsContent value="expedition">
          <ExpeditionReport />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;