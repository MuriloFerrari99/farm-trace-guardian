import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Phone, 
  Mail, 
  MessageSquare, 
  Calendar, 
  Users, 
  MapPin, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Edit,
  Trash2,
  Building,
  Target
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TaskListProps {
  tasks: any[];
  isLoading?: boolean;
  onEditTask?: (task: any) => void;
  onDeleteTask?: (taskId: string) => void;
  onCompleteTask?: (taskId: string) => void;
  showCompactView?: boolean;
}

const TaskList = ({ 
  tasks, 
  isLoading, 
  onEditTask, 
  onDeleteTask, 
  onCompleteTask,
  showCompactView = false 
}: TaskListProps) => {
  const getTaskIcon = (type: string) => {
    const iconMap = {
      ligacao: Phone,
      reuniao: Users,
      email: Mail,
      follow_up: MessageSquare,
      proposta: Target,
      visita: MapPin,
      outros: Calendar
    };
    const IconComponent = iconMap[type as keyof typeof iconMap] || Calendar;
    return <IconComponent className="h-4 w-4" />;
  };

  const getTaskTypeLabel = (type: string) => {
    const typeMap = {
      ligacao: 'Ligação',
      reuniao: 'Reunião',
      email: 'E-mail',
      follow_up: 'Follow-up',
      proposta: 'Proposta',
      visita: 'Visita',
      outros: 'Outros'
    };
    return typeMap[type as keyof typeof typeMap] || type;
  };

  const getStatusBadge = (status: string, dueDate: string) => {
    const isOverdue = new Date(dueDate) < new Date() && status !== 'concluida' && status !== 'cancelada';
    
    if (isOverdue) {
      return <Badge variant="destructive" className="text-xs">Atrasada</Badge>;
    }

    const statusMap = {
      pendente: { label: 'Pendente', variant: 'secondary' as const },
      em_andamento: { label: 'Em Andamento', variant: 'default' as const },
      concluida: { label: 'Concluída', variant: 'outline' as const },
      cancelada: { label: 'Cancelada', variant: 'destructive' as const }
    };

    const config = statusMap[status as keyof typeof statusMap];
    if (!config) return null;

    return <Badge variant={config.variant} className="text-xs">{config.label}</Badge>;
  };

  const getPriorityColor = (dueDate: string, status: string) => {
    if (status === 'concluida' || status === 'cancelada') return 'border-l-gray-300';
    
    const due = new Date(dueDate);
    const now = new Date();
    const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 0) return 'border-l-red-500'; // Overdue
    if (diffHours < 24) return 'border-l-orange-500'; // Due today
    if (diffHours < 72) return 'border-l-yellow-500'; // Due in 3 days
    return 'border-l-blue-500'; // Future
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500 mb-2">Nenhuma tarefa encontrada.</p>
        <p className="text-sm text-gray-400">
          Crie sua primeira tarefa para começar a organizar suas atividades.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <Card 
          key={task.id} 
          className={`border-l-4 ${getPriorityColor(task.due_date, task.status)} transition-all hover:shadow-md`}
        >
          <CardContent className={showCompactView ? "p-3" : "p-4"}>
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    {getTaskIcon(task.task_type)}
                  </div>
                  <span className="font-medium text-sm">
                    {getTaskTypeLabel(task.task_type)}
                  </span>
                  {getStatusBadge(task.status, task.due_date)}
                </div>
                
                <h4 className="font-semibold text-gray-900 mb-1">{task.title}</h4>
                
                {task.description && !showCompactView && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {task.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>
                      {format(new Date(task.due_date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </span>
                  </div>
                  
                  {task.contact && (
                    <div className="flex items-center gap-1">
                      <Building className="h-3 w-3" />
                      <span>{task.contact.company_name}</span>
                    </div>
                  )}

                  {task.assigned_to_profile && (
                    <div className="flex items-center gap-1">
                      <span>Por: {task.assigned_to_profile.name}</span>
                    </div>
                  )}
                </div>

                {task.reminder_date && (
                  <div className="flex items-center gap-1 text-xs text-orange-600 mt-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      Lembrete: {format(new Date(task.reminder_date), 'dd/MM HH:mm', { locale: ptBR })}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1 ml-4">
                {task.status !== 'concluida' && task.status !== 'cancelada' && onCompleteTask && (
                  <Button
                    onClick={() => onCompleteTask(task.id)}
                    variant="ghost"
                    size="sm"
                    className="text-green-600 hover:text-green-700 h-8 w-8 p-0"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                )}
                
                {onEditTask && (
                  <Button
                    onClick={() => onEditTask(task)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                
                {onDeleteTask && (
                  <Button
                    onClick={() => onDeleteTask(task.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TaskList;