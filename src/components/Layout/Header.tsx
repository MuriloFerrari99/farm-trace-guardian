
import React from 'react';
import { Bell, User, Settings, LogOut, Globe } from 'lucide-react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

const Header = () => {
  const { user, profile, signOut } = useAuthContext();
  const { language, toggleLanguage, t } = useLanguage();

  const logout = () => {
    signOut();
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {t('welcome')}, {profile?.name || user?.email || 'Admin'}
          </h2>
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            GLOBALG.A.P. {t('certified')}
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={toggleLanguage}
            className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <Globe className="h-4 w-4" />
            <span className="text-sm font-medium">{language.toUpperCase()}</span>
          </button>
          
          <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <User className="h-8 w-8 p-1 bg-gray-100 rounded-full" />
              <div className="text-sm">
                <p className="font-medium text-gray-900">{profile?.name || user?.email || 'Admin'}</p>
                <p className="text-gray-500">{profile?.role || 'Administrator'}</p>
              </div>
            </div>
            
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Settings className="h-5 w-5" />
            </button>
            
            <button 
              onClick={logout}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
