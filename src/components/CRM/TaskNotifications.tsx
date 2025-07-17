import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Clock, AlertTriangle, Calendar, CheckCircle } from 'lucide-react';
import { useCrmTasks } from '@/hooks/useCrmTasks';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const TaskNotifications = () => {
  const { overdueTasks, todaysTasks, upcomingTasks, updateTask } = useCrmTasks();

  const handleCompleteTask = (taskId: string) => {
    updateTask({ 
      id: taskId, 
      status: 'concluida', 
      completed_at: new Date().toISOString() 
    });
  };

  const totalNotifications = overdueTasks.length + todaysTasks.length;

  if (totalNotifications === 0) {
    return null;
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-orange-700">
          <Bell className="h-5 w-5" />
          Notificações de Tarefas
          <Badge variant="secondary" className="ml-auto">
            {totalNotifications}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tarefas Atrasadas */}
        {overdueTasks.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="font-medium text-red-700">
                {overdueTasks.length} tarefa{overdueTasks.length !== 1 ? 's' : ''} atrasada{overdueTasks.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="space-y-2">
              {overdueTasks.slice(0, 3).map((task) => (
                <div key={task.id} className="flex items-center justify-between bg-white p-2 rounded border border-red-200">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {task.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      Venceu em {format(new Date(task.due_date), 'dd/MM HH:mm', { locale: ptBR })}
                    </p>
                    {task.contact && (
                      <p className="text-xs text-gray-400">
                        {task.contact.company_name}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={() => handleCompleteTask(task.id)}
                    variant="ghost"
                    size="sm"
                    className="text-green-600 hover:text-green-700 ml-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {overdueTasks.length > 3 && (
                <p className="text-xs text-gray-500 text-center">
                  e mais {overdueTasks.length - 3} tarefa{overdueTasks.length - 3 !== 1 ? 's' : ''}...
                </p>
              )}
            </div>
          </div>
        )}

        {/* Tarefas de Hoje */}
        {todaysTasks.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <span className="font-medium text-orange-700">
                {todaysTasks.length} tarefa{todaysTasks.length !== 1 ? 's' : ''} para hoje
              </span>
            </div>
            <div className="space-y-2">
              {todaysTasks.slice(0, 3).map((task) => (
                <div key={task.id} className="flex items-center justify-between bg-white p-2 rounded border border-orange-200">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {task.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(task.due_date), 'HH:mm', { locale: ptBR })}
                    </p>
                    {task.contact && (
                      <p className="text-xs text-gray-400">
                        {task.contact.company_name}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={() => handleCompleteTask(task.id)}
                    variant="ghost"
                    size="sm"
                    className="text-green-600 hover:text-green-700 ml-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {todaysTasks.length > 3 && (
                <p className="text-xs text-gray-500 text-center">
                  e mais {todaysTasks.length - 3} tarefa{todaysTasks.length - 3 !== 1 ? 's' : ''}...
                </p>
              )}
            </div>
          </div>
        )}

        {/* Próximas Tarefas - Somente preview */}
        {upcomingTasks.length > 0 && totalNotifications === 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span className="font-medium text-blue-700">
                Próximas tarefas ({upcomingTasks.length})
              </span>
            </div>
            <div className="space-y-1">
              {upcomingTasks.slice(0, 2).map((task) => (
                <div key={task.id} className="bg-white p-2 rounded border border-blue-200">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {task.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(task.due_date), 'dd/MM HH:mm', { locale: ptBR })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskNotifications;