import React, { useState } from 'react';
import { Calendar, Clock, Plus, Search, Filter, CheckCircle, AlertTriangle, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCrmTasks } from '@/hooks/useCrmTasks';
import NewTaskModal from './NewTaskModal';
import TaskList from './TaskList';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const CrmScheduling = () => {
  const [showNewTask, setShowNewTask] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { 
    tasks, 
    isLoading, 
    overdueTasks, 
    todaysTasks, 
    upcomingTasks,
    createTask, 
    updateTask, 
    deleteTask,
    isCreating 
  } = useCrmTasks();

  // Filter tasks based on search and filters
  const filteredTasks = tasks?.filter(task => {
    const matchesSearch = !searchTerm || 
      task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.contact?.company_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Get tasks for selected date
  const selectedDateTasks = tasks?.filter(task => 
    isSameDay(new Date(task.due_date), selectedDate)
  ) || [];

  const handleCreateTask = (data: any) => {
    createTask(data);
    setShowNewTask(false);
  };

  const handleCompleteTask = (taskId: string) => {
    updateTask({ 
      id: taskId, 
      status: 'concluida', 
      completed_at: new Date().toISOString() 
    });
  };

  // Stats for dashboard cards
  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter(t => t.status === 'concluida').length || 0;
  const pendingTasks = tasks?.filter(t => t.status === 'pendente').length || 0;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Tarefas</p>
                <p className="text-2xl font-bold">{totalTasks}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold">{pendingTasks}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Concluídas</p>
                <p className="text-2xl font-bold">{completedTasks}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Atrasadas</p>
                <p className="text-2xl font-bold">{overdueTasks.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="list" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="list">Lista de Tarefas</TabsTrigger>
            <TabsTrigger value="calendar">Calendário</TabsTrigger>
            <TabsTrigger value="dashboard">Visão Geral</TabsTrigger>
          </TabsList>
          
          <Button onClick={() => setShowNewTask(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Tarefa
          </Button>
        </div>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Gerenciamento de Tarefas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar tarefas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                    <SelectItem value="concluida">Concluída</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Mais Filtros
                </Button>
              </div>

              {/* Tasks List */}
              <TaskList 
                tasks={filteredTasks} 
                isLoading={isLoading}
                onCompleteTask={handleCompleteTask}
                onDeleteTask={deleteTask}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Calendário</CardTitle>
              </CardHeader>
              <CardContent>
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => setSelectedDate(date || new Date())}
                  className="rounded-md border"
                  modifiers={{
                    taskDay: (date) => tasks?.some(task => isSameDay(new Date(task.due_date), date)) || false
                  }}
                  modifiersStyles={{
                    taskDay: { 
                      backgroundColor: 'hsl(var(--primary))', 
                      color: 'white',
                      fontWeight: 'bold'
                    }
                  }}
                />
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>
                  Tarefas para {format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TaskList 
                  tasks={selectedDateTasks} 
                  isLoading={isLoading}
                  onCompleteTask={handleCompleteTask}
                  onDeleteTask={deleteTask}
                  showCompactView
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="dashboard">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Tarefas Atrasadas ({overdueTasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TaskList 
                  tasks={overdueTasks} 
                  isLoading={isLoading}
                  onCompleteTask={handleCompleteTask}
                  onDeleteTask={deleteTask}
                  showCompactView
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <Clock className="h-5 w-5" />
                  Tarefas de Hoje ({todaysTasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TaskList 
                  tasks={todaysTasks} 
                  isLoading={isLoading}
                  onCompleteTask={handleCompleteTask}
                  onDeleteTask={deleteTask}
                  showCompactView
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <Calendar className="h-5 w-5" />
                  Próximas Tarefas ({upcomingTasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TaskList 
                  tasks={upcomingTasks} 
                  isLoading={isLoading}
                  onCompleteTask={handleCompleteTask}
                  onDeleteTask={deleteTask}
                  showCompactView
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* New Task Modal */}
      <NewTaskModal
        open={showNewTask}
        onOpenChange={setShowNewTask}
        onSubmit={handleCreateTask}
        isSubmitting={isCreating}
      />
    </div>
  );
};

export default CrmScheduling;