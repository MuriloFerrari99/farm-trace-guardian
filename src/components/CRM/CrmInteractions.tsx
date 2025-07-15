import React from 'react';
import { MessageSquare, Calendar, User, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CrmInteractions = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Registro de Interações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Registro de Interações</h3>
            <p className="text-gray-600">Funcionalidade em desenvolvimento - Sistema para registrar ligações, reuniões, e-mails e follow-ups</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CrmInteractions;