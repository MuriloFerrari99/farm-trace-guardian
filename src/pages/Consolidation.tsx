import React, { useState } from 'react';
import { Merge, QrCode, Package, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ConsolidationForm from '@/components/Consolidation/ConsolidationForm';
import ConsolidatedLotsList from '@/components/Consolidation/ConsolidatedLotsList';
import LabelGenerator from '@/components/Consolidation/LabelGenerator';

const Consolidation = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <Merge className="h-8 w-8 text-purple-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Consolidação e Rotulagem</h1>
          <p className="text-gray-600">Consolidar lotes certificados e gerar rótulos com rastreabilidade</p>
        </div>
      </div>

      <Tabs defaultValue="consolidation" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="consolidation" className="flex items-center space-x-2">
            <Package className="h-4 w-4" />
            <span>Consolidação</span>
          </TabsTrigger>
          <TabsTrigger value="labels" className="flex items-center space-x-2">
            <QrCode className="h-4 w-4" />
            <span>Rotulagem</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Histórico</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="consolidation" className="space-y-6">
          <ConsolidationForm />
          <ConsolidatedLotsList />
        </TabsContent>

        <TabsContent value="labels" className="space-y-6">
          <LabelGenerator />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Histórico de consolidações será implementado</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Consolidation;