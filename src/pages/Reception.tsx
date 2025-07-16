
import React, { useState } from 'react';
import { Upload, Plus, Search, Filter, FileText, CheckCircle } from 'lucide-react';
import { useReceptions } from '../hooks/useReceptions';
import { useProducers } from '../hooks/useProducers';
import { useAuth } from '../hooks/useAuth';
import { Database } from '@/integrations/supabase/types';
import ReceptionDetailModal from '@/components/Reception/ReceptionDetailModal';
import ReceptionEditModal from '@/components/Reception/ReceptionEditModal';

const Reception = () => {
  const { receptions, isLoading, createReception, updateReception, approveReception, rejectReception } = useReceptions();
  const { producers } = useProducers();
  const { user } = useAuth();
  const [showNewReceptionForm, setShowNewReceptionForm] = useState(false);
  const [selectedReception, setSelectedReception] = useState<typeof receptions extends (infer T)[] ? T : never | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    producer_id: '',
    product_type: 'tomate' as Database['public']['Enums']['product_type'],
    quantity_kg: '',
    reception_date: new Date().toISOString().split('T')[0],
    lot_number: '',
    harvest_date: '',
    notes: '',
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Aprovado';
      case 'pending': return 'Pendente';
      case 'rejected': return 'Rejeitado';
      default: return 'Desconhecido';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const generateReceptionCode = () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `REC${year}${month}${day}${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const receptionData = {
      reception_code: generateReceptionCode(),
      producer_id: formData.producer_id,
      product_type: formData.product_type,
      quantity_kg: parseFloat(formData.quantity_kg),
      reception_date: formData.reception_date,
      lot_number: formData.lot_number || null,
      harvest_date: formData.harvest_date || null,
      notes: formData.notes || null,
      received_by: user?.id || null,
    };

    createReception.mutate(receptionData, {
      onSuccess: () => {
        setShowNewReceptionForm(false);
        setFormData({
          producer_id: '',
          product_type: 'tomate',
          quantity_kg: '',
          reception_date: new Date().toISOString().split('T')[0],
          lot_number: '',
          harvest_date: '',
          notes: '',
        });
      },
    });
  };

  const handleViewReception = (reception: typeof receptions extends (infer T)[] ? T : never) => {
    setSelectedReception(reception);
    setShowDetailModal(true);
  };

  const handleEditReception = (reception?: typeof receptions extends (infer T)[] ? T : never) => {
    if (reception) {
      setSelectedReception(reception);
    }
    setShowDetailModal(false);
    setShowEditModal(true);
  };

  const handleSaveReception = (id: string, updates: Partial<Database['public']['Tables']['receptions']['Update']>) => {
    updateReception.mutate({ id, updates }, {
      onSuccess: () => {
        setShowEditModal(false);
        setSelectedReception(null);
      }
    });
  };

  const handleApproveReception = (id: string) => {
    approveReception.mutate(id, {
      onSuccess: () => {
        setShowDetailModal(false);
        setSelectedReception(null);
      }
    });
  };

  const handleRejectReception = (id: string) => {
    rejectReception.mutate(id, {
      onSuccess: () => {
        setShowDetailModal(false);
        setSelectedReception(null);
      }
    });
  };

  const closeModals = () => {
    setShowDetailModal(false);
    setShowEditModal(false);
    setSelectedReception(null);
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Módulo de Recebimento</h1>
          <p className="text-gray-600">Controle de entrada de produtos certificados GLOBALG.A.P.</p>
        </div>
        <button
          onClick={() => setShowNewReceptionForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Novo Recebimento</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por produtor, GGN ou lote..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="h-4 w-4" />
            <span>Filtros</span>
          </button>
        </div>
      </div>

      {/* Receptions List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recebimentos Recentes</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produtor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GGN</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {receptions?.map((reception) => (
                <tr key={reception.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {reception.reception_code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {reception.producer?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                    {reception.producer?.ggn}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                    {reception.product_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {reception.quantity_kg}kg
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(reception.reception_date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(reception.status || 'pending')}`}>
                      {getStatusText(reception.status || 'pending')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => handleViewReception(reception)}
                      className="text-green-600 hover:text-green-900 mr-3"
                    >
                      Ver
                    </button>
                    <button 
                      onClick={() => handleEditReception(reception)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Reception Modal */}
      {showNewReceptionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Novo Recebimento</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Produtor
                  </label>
                  <select
                    name="producer_id"
                    value={formData.producer_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecionar produtor...</option>
                    {producers?.map((producer) => (
                      <option key={producer.id} value={producer.id}>
                        {producer.name} (GGN: {producer.ggn})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Produto
                  </label>
                  <select
                    name="product_type"
                    value={formData.product_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="tomate">Tomate</option>
                    <option value="alface">Alface</option>
                    <option value="pepino">Pepino</option>
                    <option value="pimentao">Pimentão</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantidade (kg)
                  </label>
                  <input
                    type="number"
                    name="quantity_kg"
                    value={formData.quantity_kg}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ex: 1500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Recebimento
                  </label>
                  <input
                    type="date"
                    name="reception_date"
                    value={formData.reception_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número do Lote (Opcional)
                  </label>
                  <input
                    type="text"
                    name="lot_number"
                    value={formData.lot_number}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ex: LOTE001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data da Colheita (Opcional)
                  </label>
                  <input
                    type="date"
                    name="harvest_date"
                    value={formData.harvest_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações (Opcional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Observações adicionais sobre o recebimento..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload de Documentos
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Arraste e solte os arquivos aqui ou clique para selecionar
                  </p>
                  <p className="text-xs text-gray-500">
                    Documentos necessários: Nota Fiscal, Packing List, Certificado GLOBALG.A.P.
                  </p>
                  <button type="button" className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    Selecionar Arquivos
                  </button>
                </div>
              </div>
            </form>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowNewReceptionForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={createReception.isPending}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors flex items-center space-x-2"
              >
                {createReception.isPending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : (
                  <span>Registrar Recebimento</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedReception && (
        <ReceptionDetailModal
          reception={selectedReception}
          isOpen={showDetailModal}
          onClose={closeModals}
          onApprove={handleApproveReception}
          onReject={handleRejectReception}
          onEdit={() => handleEditReception()}
        />
      )}

      {/* Edit Modal */}
      {selectedReception && (
        <ReceptionEditModal
          reception={selectedReception}
          isOpen={showEditModal}
          onClose={closeModals}
          onSave={handleSaveReception}
        />
      )}
    </div>
  );
};

export default Reception;
