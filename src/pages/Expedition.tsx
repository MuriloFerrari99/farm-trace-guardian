import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ExpeditionForm from '@/components/Expedition/ExpeditionForm';
import ExpeditionsList from '@/components/Expedition/ExpeditionsList';
import ExpeditionDocuments from '@/components/Expedition/ExpeditionDocuments';
import { Truck, Package, FileText, BarChart3 } from 'lucide-react';

export default function Expedition() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Módulo de Expedição</h1>
        <p className="text-gray-600">
          Gerencie conferência de carga, documentação e registros de expedição
        </p>
      </div>

      <Tabs defaultValue="new-expedition" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="new-expedition" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Nova Expedição
          </TabsTrigger>
          <TabsTrigger value="expeditions-list" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Expedições
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documentos
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new-expedition">
          <ExpeditionForm />
        </TabsContent>

        <TabsContent value="expeditions-list">
          <ExpeditionsList />
        </TabsContent>

        <TabsContent value="documents">
          <ExpeditionDocuments />
        </TabsContent>

        <TabsContent value="reports">
          <div className="text-center py-12">
            <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Relatórios de Expedição</h3>
            <p className="text-muted-foreground mb-6">
              Relatórios detalhados por expedição, cliente, data e não conformidades
            </p>
            <p className="text-sm text-muted-foreground">
              Funcionalidade em desenvolvimento...
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}