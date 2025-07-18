import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Building, User, Mail, Phone, MapPin, Calendar, Edit, Trash2, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCrmInteractions } from '@/hooks/useCrmInteractions';
import { useCrmTasks } from '@/hooks/useCrmTasks';
import { useCrmOpportunities } from '@/hooks/useCrmOpportunities';
import InteractionTimeline from './InteractionTimeline';
import NewInteractionModal from './NewInteractionModal';
import NewTaskModal from './NewTaskModal';
import TaskList from './TaskList';

interface ContactDetailModalProps {
  contact: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}

const ContactDetailModal = ({ 
  contact, 
  open, 
  onOpenChange, 
  onEdit, 
  onDelete 
}: ContactDetailModalProps) => {
  const [showNewInteraction, setShowNewInteraction] = useState(false);
  const [showNewTask, setShowNewTask] = useState(false);
  const [showNewOpportunity, setShowNewOpportunity] = useState(false);
  
  const { opportunities } = useCrmOpportunities();
  const { interactions, isLoading, createInteraction, isCreating } = useCrmInteractions(contact?.id);
  const { 
    tasks, 
    isLoading: isLoadingTasks, 
    createTask, 
    updateTask, 
    deleteTask,
    isCreating: isCreatingTask 
  } = useCrmTasks({ contactId: contact?.id });

  if (!contact) return null;

  const getStatusBadge = (status: string) => {
    const statusMap = {
      ativo: { label: 'Ativo', variant: 'default' as const },
      desqualificado: { label: 'Desqualificado', variant: 'destructive' as const },
      em_negociacao: { label: 'Em Negociação', variant: 'secondary' as const }
    };
    const config = statusMap[status as keyof typeof statusMap] || statusMap.ativo;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getSegmentLabel = (segment: string) => {
    const segmentMap = {
      importador: 'Importador',
      distribuidor: 'Distribuidor',
      varejo: 'Varejo',
      atacado: 'Atacado',
      industria: 'Indústria',
      outros: 'Outros'
    };
    return segmentMap[segment as keyof typeof segmentMap] || segment;
  };

  const handleCreateInteraction = (data: any) => {
    createInteraction({
      ...data,
      contact_id: contact.id
    });
    setShowNewInteraction(false);
  };

  const handleCreateTask = (data: any) => {
    createTask({
      ...data,
      contact_id: contact.id
    });
    setShowNewTask(false);
  };

  const handleCompleteTask = (taskId: string) => {
    updateTask({ 
      id: taskId, 
      status: 'concluida', 
      completed_at: new Date().toISOString() 
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              {contact.company_name}
            </div>
            <div className="flex gap-2">
              <Button onClick={onEdit} variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button onClick={onDelete} variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Informações da Empresa</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{contact.company_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span>{contact.contact_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{contact.email}</span>
                  </div>
                  {contact.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{contact.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {(contact.country || contact.state || contact.city) && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Localização</h3>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>
                      {[contact.city, contact.state, contact.country].filter(Boolean).join(', ')}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Status e Classificação</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Status:</span>
                    {getStatusBadge(contact.status)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Segmento:</span>
                    <Badge variant="outline">{getSegmentLabel(contact.segment)}</Badge>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Informações do Sistema</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Criado em: {format(new Date(contact.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                  </div>
                  {contact.created_by_profile?.name && (
                    <div>Por: {contact.created_by_profile.name}</div>
                  )}
                  {contact.assigned_to_profile?.name && (
                    <div>Responsável: {contact.assigned_to_profile.name}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {contact.whatsapp && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">WhatsApp</h3>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>{contact.whatsapp}</span>
              </div>
            </div>
          )}

          {contact.general_notes && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Observações Gerais</h3>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                {contact.general_notes}
              </p>
            </div>
          )}

          <Separator />

          {/* Tarefas Relacionadas */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Tarefas</h3>
              <Button 
                onClick={() => setShowNewTask(true)}
                size="sm"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Tarefa
              </Button>
            </div>
            <TaskList 
              tasks={tasks?.filter(task => task.contact_id === contact.id) || []} 
              isLoading={isLoadingTasks}
              onCompleteTask={handleCompleteTask}
              onDeleteTask={deleteTask}
              showCompactView
            />
          </div>

          <Separator />

          {/* Timeline de Interações */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Timeline de Interações</h3>
              <Button 
                onClick={() => setShowNewInteraction(true)}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Interação
              </Button>
            </div>
            <InteractionTimeline 
              interactions={interactions} 
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* New Task Modal */}
        <NewTaskModal
          open={showNewTask}
          onOpenChange={setShowNewTask}
          onSubmit={handleCreateTask}
          isSubmitting={isCreatingTask}
          contactId={contact.id}
        />

        {/* New Interaction Modal */}
        <NewInteractionModal
          open={showNewInteraction}
          onOpenChange={setShowNewInteraction}
          onSubmit={handleCreateInteraction}
          isSubmitting={isCreating}
          contactId={contact.id}
          contactName={contact.company_name}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ContactDetailModal;