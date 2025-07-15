
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
  DollarSign
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const Sidebar = () => {
  const { t } = useLanguage();
  const [operationsOpen, setOperationsOpen] = useState(true);

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

  const otherMenuItems = [
    { path: '/financial', icon: DollarSign, key: 'financial' },
    { path: '/reports', icon: FileTextIcon, key: 'reports' },
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
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-green-50 text-green-700 border-l-4 border-green-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
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
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-green-50 text-green-700 border-l-4 border-green-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`
                    }
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="font-medium">{t(item.key)}</span>
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
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-green-50 text-green-700 border-l-4 border-green-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
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
