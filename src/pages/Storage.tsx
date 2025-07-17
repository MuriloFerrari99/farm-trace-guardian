import React from 'react';
import { Warehouse } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LotMovementForm from '@/components/Storage/LotMovementForm';
import StorageChecklist from '@/components/Storage/StorageChecklist';
import CurrentLotsList from '@/components/Storage/CurrentLotsList';

const Storage = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <Warehouse className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sistema de Armazenamento</h1>
          <p className="text-gray-600">Controle digital de lotes e rastreabilidade completa</p>
        </div>
      </div>

      <Tabs defaultValue="movement" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="movement">Movimentações</TabsTrigger>
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
          <TabsTrigger value="lots">Lotes Atuais</TabsTrigger>
        </TabsList>

        <TabsContent value="movement" className="space-y-6">
          <LotMovementForm />
        </TabsContent>

        <TabsContent value="checklist" className="space-y-6">
          <StorageChecklist />
        </TabsContent>

        <TabsContent value="lots" className="space-y-6">
          <CurrentLotsList />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Storage;