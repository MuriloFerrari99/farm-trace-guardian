import React from 'react';
import { X, Calendar, Package, User, FileText, CheckCircle, XCircle } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type Reception = Database['public']['Tables']['receptions']['Row'] & {
  producer: Database['public']['Tables']['producers']['Row'];
};

interface ReceptionDetailModalProps {
  reception: Reception;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onEdit: () => void;
}

const ReceptionDetailModal: React.FC<ReceptionDetailModalProps> = ({
  reception,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onEdit,
}) => {
  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Detalhes do Recebimento</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Header Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código do Recebimento
              </label>
              <p className="text-lg font-mono bg-gray-50 p-2 rounded">
                {reception.reception_code}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(reception.status || 'pending')}`}>
                {getStatusText(reception.status || 'pending')}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Recebimento
              </label>
              <p className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(reception.reception_date).toLocaleDateString('pt-BR')}</span>
              </p>
            </div>
          </div>

          {/* Producer Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Informações do Produtor</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <p className="text-gray-900">{reception.producer?.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GGN
                </label>
                <p className="text-gray-900 font-mono">{reception.producer?.ggn}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fazenda
                </label>
                <p className="text-gray-900">{reception.producer?.farm_name || 'Não informado'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <p className="text-gray-900">{reception.producer?.email || 'Não informado'}</p>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Informações do Produto</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Produto
                </label>
                <p className="text-gray-900 capitalize">{reception.product_type}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantidade
                </label>
                <p className="text-gray-900">{reception.quantity_kg} kg</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número do Lote
                </label>
                <p className="text-gray-900">{reception.lot_number || 'Não informado'}</p>
              </div>
            </div>
            {reception.harvest_date && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data da Colheita
                </label>
                <p className="text-gray-900">{new Date(reception.harvest_date).toLocaleDateString('pt-BR')}</p>
              </div>
            )}
          </div>

          {/* Notes */}
          {reception.notes && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Observações</span>
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-900">{reception.notes}</p>
              </div>
            </div>
          )}

          {/* Documents Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Documentos</span>
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
              <p>Nenhum documento encontrado</p>
              <p className="text-sm">Use o botão "Editar" para adicionar documentos</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 flex justify-between">
          <div className="flex space-x-3">
            {reception.status === 'pending' && (
              <>
                <button
                  onClick={() => onApprove(reception.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Aprovar</span>
                </button>
                <button
                  onClick={() => onReject(reception.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Rejeitar</span>
                </button>
              </>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Editar
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceptionDetailModal;