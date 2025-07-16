import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import { useProducers } from '@/hooks/useProducers';

type Reception = Database['public']['Tables']['receptions']['Row'] & {
  producer: Database['public']['Tables']['producers']['Row'];
};

interface ReceptionEditModalProps {
  reception: Reception;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Database['public']['Tables']['receptions']['Update']>) => void;
}

const ReceptionEditModal: React.FC<ReceptionEditModalProps> = ({
  reception,
  isOpen,
  onClose,
  onSave,
}) => {
  const { producers } = useProducers();
  const [formData, setFormData] = useState({
    producer_id: reception.producer_id,
    product_type: reception.product_type,
    quantity_kg: reception.quantity_kg.toString(),
    reception_date: reception.reception_date,
    lot_number: reception.lot_number || '',
    harvest_date: reception.harvest_date || '',
    notes: reception.notes || '',
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        producer_id: reception.producer_id,
        product_type: reception.product_type,
        quantity_kg: reception.quantity_kg.toString(),
        reception_date: reception.reception_date,
        lot_number: reception.lot_number || '',
        harvest_date: reception.harvest_date || '',
        notes: reception.notes || '',
      });
    }
  }, [reception, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const updates = {
      producer_id: formData.producer_id,
      product_type: formData.product_type as Database['public']['Enums']['product_type'],
      quantity_kg: parseFloat(formData.quantity_kg),
      reception_date: formData.reception_date,
      lot_number: formData.lot_number || null,
      harvest_date: formData.harvest_date || null,
      notes: formData.notes || null,
    };

    onSave(reception.id, updates);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Editar Recebimento</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
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
              Gerenciar Documentos
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
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceptionEditModal;