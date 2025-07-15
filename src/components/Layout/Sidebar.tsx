
import React from 'react';
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
  Globe
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const Sidebar = () => {
  const { t } = useLanguage();

  const menuItems = [
    { path: '/', icon: BarChart3Icon, key: 'dashboard' },
    { path: '/reception', icon: TruckIcon, key: 'reception' },
    { path: '/identification', icon: TagIcon, key: 'identification' },
    { path: '/storage', icon: WarehouseIcon, key: 'storage' },
    { path: '/consolidation', icon: PackageIcon, key: 'consolidation' },
    { path: '/expedition', icon: TruckIcon, key: 'expedition' },
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
          {menuItems.map((item) => (
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
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
