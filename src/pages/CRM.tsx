import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Users, Phone, Target, BarChart3, FileText, PlusCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CrmContacts from '@/components/CRM/CrmContacts';
import CrmSalesFunnel from '@/components/CRM/CrmSalesFunnel';
import CrmDashboard from '@/components/CRM/CrmDashboard';
import CrmReports from '@/components/CRM/CrmReports';
import CrmInteractions from '@/components/CRM/CrmInteractions';

const CRM = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('dashboard');

  React.useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['dashboard', 'contacts', 'interactions', 'funnel', 'reports'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <Users className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CRM - Gestão de Relacionamento</h1>
          <p className="text-gray-600">Sistema de vendas para trading companies e distribuidoras</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="contacts" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Contatos
          </TabsTrigger>
          <TabsTrigger value="interactions" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Interações
          </TabsTrigger>
          <TabsTrigger value="funnel" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Funil de Vendas
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <CrmDashboard />
        </TabsContent>

        <TabsContent value="contacts">
          <CrmContacts />
        </TabsContent>

        <TabsContent value="interactions">
          <CrmInteractions />
        </TabsContent>

        <TabsContent value="funnel">
          <CrmSalesFunnel />
        </TabsContent>

        <TabsContent value="reports">
          <CrmReports />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CRM;