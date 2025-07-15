
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './pages/Dashboard';
import Reception from './pages/Reception';

const App = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
          <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Header />
              <main className="flex-1 overflow-y-auto">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/reception" element={<Reception />} />
                  <Route path="/identification" element={<div className="p-6"><h1 className="text-2xl font-bold">Módulo de Identificação</h1><p className="text-gray-600 mt-2">Em desenvolvimento...</p></div>} />
                  <Route path="/storage" element={<div className="p-6"><h1 className="text-2xl font-bold">Módulo de Armazenamento</h1><p className="text-gray-600 mt-2">Em desenvolvimento...</p></div>} />
                  <Route path="/consolidation" element={<div className="p-6"><h1 className="text-2xl font-bold">Módulo de Consolidação</h1><p className="text-gray-600 mt-2">Em desenvolvimento...</p></div>} />
                  <Route path="/expedition" element={<div className="p-6"><h1 className="text-2xl font-bold">Módulo de Expedição</h1><p className="text-gray-600 mt-2">Em desenvolvimento...</p></div>} />
                  <Route path="/reports" element={<div className="p-6"><h1 className="text-2xl font-bold">Módulo de Relatórios</h1><p className="text-gray-600 mt-2">Em desenvolvimento...</p></div>} />
                  <Route path="/producers" element={<div className="p-6"><h1 className="text-2xl font-bold">Cadastro de Produtores</h1><p className="text-gray-600 mt-2">Em desenvolvimento...</p></div>} />
                  <Route path="/compliance" element={<div className="p-6"><h1 className="text-2xl font-bold">Módulo de Conformidade</h1><p className="text-gray-600 mt-2">Em desenvolvimento...</p></div>} />
                </Routes>
              </main>
            </div>
          </div>
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;
