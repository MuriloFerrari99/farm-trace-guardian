
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { useAuthContext } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
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
import CRM from './pages/CRM';
import ReceptionDetails from './pages/ReceptionDetails';

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
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/reception" element={<ProtectedRoute><Reception /></ProtectedRoute>} />
              <Route path="/identification" element={<ProtectedRoute><Identification /></ProtectedRoute>} />
              <Route path="/storage" element={<ProtectedRoute><Storage /></ProtectedRoute>} />
              <Route path="/consolidation" element={<ProtectedRoute><Consolidation /></ProtectedRoute>} />
              <Route path="/expedition" element={<ProtectedRoute><Expedition /></ProtectedRoute>} />
              <Route path="/financial" element={<ProtectedRoute><Financial /></ProtectedRoute>} />
              <Route path="/crm" element={<ProtectedRoute><CRM /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
              <Route path="/producers" element={<ProtectedRoute><Producers /></ProtectedRoute>} />
              <Route path="/reception/details/:id" element={<ProtectedRoute><ReceptionDetails /></ProtectedRoute>} />
              
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
