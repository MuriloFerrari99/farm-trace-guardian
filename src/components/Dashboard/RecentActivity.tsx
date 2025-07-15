
import React from 'react';
import { Clock, CheckCircle, AlertTriangle, Package } from 'lucide-react';

const activities = [
  {
    id: 1,
    type: 'reception',
    description: 'Novo lote recebido - Produtor João Silva (GGN: 4056874123456)',
    time: '2 horas atrás',
    icon: Package,
    status: 'success'
  },
  {
    id: 2,
    type: 'inspection',
    description: 'Inspeção de conformidade pendente - Lote #LC001234',
    time: '4 horas atrás',
    icon: AlertTriangle,
    status: 'warning'
  },
  {
    id: 3,
    type: 'expedition',
    description: 'Expedição concluída - 500kg para Exportadora ABC',
    time: '6 horas atrás',
    icon: CheckCircle,
    status: 'success'
  },
  {
    id: 4,
    type: 'certification',
    description: 'Certificado GLOBALG.A.P. renovado - Produtor Maria Santos',
    time: '1 dia atrás',
    icon: CheckCircle,
    status: 'success'
  }
];

const RecentActivity = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividade Recente</h3>
      
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className={`p-2 rounded-full ${getStatusColor(activity.status)}`}>
              <activity.icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{activity.description}</p>
              <div className="flex items-center mt-1 text-xs text-gray-500">
                <Clock className="h-3 w-3 mr-1" />
                {activity.time}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-4 text-sm text-green-600 hover:text-green-700 font-medium">
        Ver todas as atividades
      </button>
    </div>
  );
};

export default RecentActivity;
