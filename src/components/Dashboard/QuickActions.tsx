
import React from 'react';
import { Plus, FileText, Tag, BarChart3 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const QuickActions = () => {
  const { t } = useLanguage();

  const actions = [
    {
      icon: Plus,
      label: t('registerProducer'),
      color: 'bg-green-600 hover:bg-green-700',
      onClick: () => console.log('Register producer')
    },
    {
      icon: Plus,
      label: t('newReception'),
      color: 'bg-blue-600 hover:bg-blue-700',
      onClick: () => console.log('New reception')
    },
    {
      icon: Tag,
      label: t('generateLabel'),
      color: 'bg-purple-600 hover:bg-purple-700',
      onClick: () => console.log('Generate label')
    },
    {
      icon: FileText,
      label: t('viewReports'),
      color: 'bg-orange-600 hover:bg-orange-700',
      onClick: () => console.log('View reports')
    }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('quickActions')}</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={`${action.color} text-white p-4 rounded-lg transition-colors flex items-center justify-center space-x-2 hover:shadow-md`}
          >
            <action.icon className="h-5 w-5" />
            <span className="text-sm font-medium">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
