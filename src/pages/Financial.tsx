import React from 'react';
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
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <DollarSign className="h-8 w-8 text-green-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Módulo Financeiro</h1>
          <p className="text-gray-600">Gestão financeira completa e operações de comércio exterior</p>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Dashboard
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