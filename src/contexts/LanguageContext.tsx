
import React, { createContext, useContext, useState } from 'react';

type Language = 'pt' | 'en';

const translations = {
  pt: {
    dashboard: 'Dashboard',
    reception: 'Recebimento',
    identification: 'Identificação',
    storage: 'Armazenamento',
    consolidation: 'Consolidação',
    expedition: 'Expedição',
    reports: 'Relatórios',
    producers: 'Produtores',
    compliance: 'Conformidade',
    welcome: 'Bem-vindo',
    certified: 'Certificado',
    totalProducers: 'Total de Produtores',
    activeLots: 'Lotes Ativos',
    pendingInspections: 'Inspeções Pendentes',
    complianceRate: 'Taxa de Conformidade',
    recentActivity: 'Atividade Recente',
    quickActions: 'Ações Rápidas',
    registerProducer: 'Cadastrar Produtor',
    newReception: 'Novo Recebimento',
    generateLabel: 'Gerar Etiqueta',
    viewReports: 'Ver Relatórios',
  },
  en: {
    dashboard: 'Dashboard',
    reception: 'Reception',
    identification: 'Identification',
    storage: 'Storage',
    consolidation: 'Consolidation',
    expedition: 'Expedition',
    reports: 'Reports',
    producers: 'Producers',
    compliance: 'Compliance',
    welcome: 'Welcome',
    certified: 'Certified',
    totalProducers: 'Total Producers',
    activeLots: 'Active Lots',
    pendingInspections: 'Pending Inspections',
    complianceRate: 'Compliance Rate',
    recentActivity: 'Recent Activity',
    quickActions: 'Quick Actions',
    registerProducer: 'Register Producer',
    newReception: 'New Reception',
    generateLabel: 'Generate Label',
    viewReports: 'View Reports',
  },
};

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('pt');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'pt' ? 'en' : 'pt');
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
