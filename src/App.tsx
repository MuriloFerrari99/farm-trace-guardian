
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { useAuthContext } from './contexts/AuthContext';
import AuthModal from './components/Auth/AuthModal';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './pages/Dashboard';
import Reception from './pages/Reception';
import Identification from './pages/Identification';
import Storage from './pages/Storage';
import Consolidation from './pages/Consolidation';
import Producers from './pages/Producers';
import Expedition from './pages/Expedition';
import Reports from './pages/Reports';
import Financial from './pages/Financial';

const queryClient = new QueryClient();

const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuthContext();
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">AgroTrace</h1>
            <p className="text-gray-600">Sistema de Rastreabilidade GLOBALG.A.P.</p>
          </div>
          
          <button
            onClick={() => setShowAuthModal(true)}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
          >
            Acessar Sistema
          </button>
        </div>

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => setShowAuthModal(false)}
        />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/reception" element={<Reception />} />
              <Route path="/identification" element={<Identification />} />
              <Route path="/storage" element={<Storage />} />
              <Route path="/consolidation" element={<Consolidation />} />
              <Route path="/expedition" element={<Expedition />} />
              <Route path="/financial" element={<Financial />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/producers" element={<Producers />} />
            <Route path="/compliance" element={<div className="p-6"><h1 className="text-2xl font-bold">Módulo de Conformidade</h1><p className="text-gray-600 mt-2">Em desenvolvimento...</p></div>} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
          <Toaster position="top-right" />
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
