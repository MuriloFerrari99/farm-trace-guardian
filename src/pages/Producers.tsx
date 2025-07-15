
import React from 'react';
import { Users } from 'lucide-react';
import { ProducerForm } from '@/components/Producers/ProducerForm';
import { ProducersList } from '@/components/Producers/ProducersList';

const Producers = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <Users className="h-8 w-8 text-green-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cadastro de Produtores</h1>
          <p className="text-gray-600">Gerencie os produtores certificados GLOBALG.A.P.</p>
        </div>
      </div>

      <div className="space-y-6">
        <ProducerForm />
        <ProducersList />
      </div>
    </div>
  );
};

export default Producers;
