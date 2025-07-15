import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DollarSign, TrendingUp, FileText, CreditCard, Shield, Banknote } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FinancialDashboard from '@/components/Financial/FinancialDashboard';
import CashFlow from '@/components/Financial/CashFlow';
import AccountsReceivable from '@/components/Financial/AccountsReceivable';
import AccountsPayable from '@/components/Financial/AccountsPayable';
import AccContracts from '@/components/Financial/AccContracts';
import LetterOfCredit from '@/components/Financial/LetterOfCredit';
import ExportInsurance from '@/components/Financial/ExportInsurance';
import FinancialReports from '@/components/Financial/FinancialReports';

const Financial = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      const validTabs = ['dashboard', 'dre', 'cash-flow', 'accounts-receivable', 'accounts-payable', 'acc-contracts', 'letter-of-credit', 'export-insurance', 'reports'];
      const mappedTab = {
        'accounts-receivable': 'receivable',
        'accounts-payable': 'payable',
        'acc-contracts': 'acc',
        'letter-of-credit': 'lc',
        'export-insurance': 'insurance'
      }[tab] || tab;
      
      if (validTabs.includes(tab) || Object.keys({
        'accounts-receivable': 'receivable',
        'accounts-payable': 'payable',
        'acc-contracts': 'acc',
        'letter-of-credit': 'lc',
        'export-insurance': 'insurance'
      }).includes(tab)) {
        setActiveTab(mappedTab);
      }
    }
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Update URL without page reload
    const tabMapping = {
      'receivable': 'accounts-receivable',
      'payable': 'accounts-payable',
      'acc': 'acc-contracts',
      'lc': 'letter-of-credit',
      'insurance': 'export-insurance'
    };
    const urlTab = tabMapping[value as keyof typeof tabMapping] || value;
    setSearchParams({ tab: urlTab });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <DollarSign className="h-8 w-8 text-green-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Módulo Financeiro</h1>
          <p className="text-gray-600">Gestão financeira completa e operações de comércio exterior</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="dre" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            DRE
          </TabsTrigger>
          <TabsTrigger value="cash-flow" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Fluxo de Caixa
          </TabsTrigger>
          <TabsTrigger value="receivable" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            A Receber
          </TabsTrigger>
          <TabsTrigger value="payable" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            A Pagar
          </TabsTrigger>
          <TabsTrigger value="acc" className="flex items-center gap-2">
            <Banknote className="h-4 w-4" />
            ACC
          </TabsTrigger>
          <TabsTrigger value="lc" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Carta Crédito
          </TabsTrigger>
          <TabsTrigger value="insurance" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Seguros
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <FinancialDashboard />
        </TabsContent>

        <TabsContent value="dre">
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">DRE - Demonstrativo de Resultados</h3>
            <p className="text-gray-600">Em desenvolvimento - Relatório de demonstrativo de resultados</p>
          </div>
        </TabsContent>

        <TabsContent value="cash-flow">
          <CashFlow />
        </TabsContent>

        <TabsContent value="receivable">
          <AccountsReceivable />
        </TabsContent>

        <TabsContent value="payable">
          <AccountsPayable />
        </TabsContent>

        <TabsContent value="acc">
          <AccContracts />
        </TabsContent>

        <TabsContent value="lc">
          <LetterOfCredit />
        </TabsContent>

        <TabsContent value="insurance">
          <ExportInsurance />
        </TabsContent>

        <TabsContent value="reports">
          <FinancialReports />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Financial;