
import React from 'react';
import LabelForm from '@/components/Identification/LabelForm';
import LabelList from '@/components/Identification/LabelList';

const Identification = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Módulo de Identificação</h1>
        <p className="text-gray-600 mt-2">
          Crie etiquetas com QR codes para rastreabilidade dos produtos recebidos
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LabelForm />
        <div className="lg:col-span-2">
          <LabelList />
        </div>
      </div>
    </div>
  );
};

export default Identification;
