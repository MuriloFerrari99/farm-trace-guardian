
import React from 'react';
import { Users, Package, AlertTriangle, TrendingUp } from 'lucide-react';
import StatsCard from '../components/Dashboard/StatsCard';
import RecentActivity from '../components/Dashboard/RecentActivity';
import QuickActions from '../components/Dashboard/QuickActions';
import { useLanguage } from '../contexts/LanguageContext';

const Dashboard = () => {
  const { t } = useLanguage();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('dashboard')}</h1>
        <p className="text-gray-600">Visão geral do sistema de rastreabilidade GLOBALG.A.P.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title={t('totalProducers')}
          value="156"
          icon={Users}
          color="green"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title={t('activeLots')}
          value="89"
          icon={Package}
          color="blue"
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title={t('pendingInspections')}
          value="7"
          icon={AlertTriangle}
          color="yellow"
          trend={{ value: -15, isPositive: false }}
        />
        <StatsCard
          title={t('complianceRate')}
          value="98.5%"
          icon={TrendingUp}
          color="green"
          trend={{ value: 2.1, isPositive: true }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity - Takes 2 columns */}
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>

        {/* Quick Actions - Takes 1 column */}
        <div>
          <QuickActions />
        </div>
      </div>

      {/* Charts Section */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recebimentos por Mês</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Gráfico de recebimentos será implementado aqui</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Região</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Gráfico de distribuição será implementado aqui</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
