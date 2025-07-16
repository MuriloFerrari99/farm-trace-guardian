
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  TruckIcon, 
  TagIcon, 
  WarehouseIcon, 
  PackageIcon, 
  FileTextIcon, 
  BarChart3Icon,
  Users,
  Shield,
  Globe,
  ChevronDown,
  ChevronRight,
  DollarSign,
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Building,
  FileCheck,
  Calculator,
  Phone,
  Target
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const Sidebar = () => {
  const { t } = useLanguage();
  const [operationsOpen, setOperationsOpen] = useState(true);
  const [financialOpen, setFinancialOpen] = useState(true);
  const [commercialOpen, setCommercialOpen] = useState(true);

  const mainMenuItems = [
    { path: '/', icon: BarChart3Icon, key: 'dashboard' },
  ];

  const operationsItems = [
    { path: '/reception', icon: TruckIcon, key: 'reception' },
    { path: '/identification', icon: TagIcon, key: 'identification' },
    { path: '/storage', icon: WarehouseIcon, key: 'storage' },
    { path: '/consolidation', icon: PackageIcon, key: 'consolidation' },
    { path: '/expedition', icon: TruckIcon, key: 'expedition' },
  ];

  const financialItems = [
    { path: '/financial', icon: BarChart3Icon, key: 'Dashboard' },
    { path: '/financial?tab=dre', icon: Calculator, key: 'DRE' },
    { path: '/financial?tab=cash-flow', icon: TrendingUp, key: 'Fluxo de Caixa' },
    { path: '/financial?tab=accounts-receivable', icon: ArrowUpRight, key: 'A Receber' },
    { path: '/financial?tab=accounts-payable', icon: ArrowDownRight, key: 'A Pagar' },
    { path: '/financial?tab=acc-contracts', icon: DollarSign, key: 'ACC' },
    { path: '/financial?tab=letter-of-credit', icon: CreditCard, key: 'Carta de Crédito' },
    { path: '/financial?tab=export-insurance', icon: Building, key: 'Seguros' },
    { path: '/financial?tab=reports', icon: Calculator, key: 'Relatórios' },
  ];

  const commercialItems = [
    { path: '/crm', icon: BarChart3Icon, key: 'Dashboard' },
    { path: '/crm?tab=contacts', icon: Users, key: 'Contatos' },
    { path: '/crm?tab=interactions', icon: Phone, key: 'Interações' },
    { path: '/crm?tab=funnel', icon: Target, key: 'Funil de Vendas' },
  ];

  const otherMenuItems = [
    { path: '/producers', icon: Users, key: 'producers' },
    { path: '/compliance', icon: Shield, key: 'compliance' },
  ];

  return (
    <div className="bg-white border-r border-gray-200 w-64 min-h-screen">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-8">
          <Globe className="h-8 w-8 text-green-600" />
          <h1 className="text-xl font-bold text-gray-900">AgroTrace</h1>
        </div>
        
        <nav className="space-y-2">
          {/* Main menu items */}
          {mainMenuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{t(item.key)}</span>
            </NavLink>
          ))}

          {/* Operations category */}
          <div className="pt-2">
            <button
              onClick={() => setOperationsOpen(!operationsOpen)}
              className="flex items-center justify-between w-full px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <span className="font-medium text-sm uppercase tracking-wide">Operações</span>
              {operationsOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            
            {operationsOpen && (
              <div className="ml-4 mt-1 space-y-1">
                {operationsItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className="flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="font-medium">{t(item.key)}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {/* Financial category */}
          <div className="pt-2">
            <button
              onClick={() => setFinancialOpen(!financialOpen)}
              className="flex items-center justify-between w-full px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <span className="font-medium text-sm uppercase tracking-wide">Financeiro</span>
              {financialOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            
            {financialOpen && (
              <div className="ml-4 mt-1 space-y-1">
                {financialItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className="flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="font-medium">{item.key}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {/* Commercial category */}
          <div className="pt-2">
            <button
              onClick={() => setCommercialOpen(!commercialOpen)}
              className="flex items-center justify-between w-full px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <span className="font-medium text-sm uppercase tracking-wide">Comercial</span>
              {commercialOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            
            {commercialOpen && (
              <div className="ml-4 mt-1 space-y-1">
                {commercialItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className="flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="font-medium">{item.key}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {/* Other menu items */}
          <div className="pt-2">
            {otherMenuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{t(item.key)}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
