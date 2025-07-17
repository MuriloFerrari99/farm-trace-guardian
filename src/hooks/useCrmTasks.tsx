import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useCrmTasks = (filters?: {
  status?: string;
  assignedTo?: string;
  contactId?: string;
  dateRange?: { start: Date; end: Date };
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['crm-tasks', filters],
    queryFn: async () => {
      let query = supabase
        .from('crm_tasks')
        .select(`
          *,
          contact:crm_contacts(id, company_name, contact_name),
          opportunity:crm_opportunities(id, title),
          assigned_to_profile:profiles!crm_tasks_assigned_to_fkey(id, name),
          created_by_profile:profiles!crm_tasks_created_by_fkey(id, name)
        `)
        .order('due_date', { ascending: true });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status as 'pendente' | 'em_andamento' | 'concluida' | 'cancelada');
      }

      if (filters?.assignedTo) {
        query = query.eq('assigned_to', filters.assignedTo);
      }

      if (filters?.contactId) {
        query = query.eq('contact_id', filters.contactId);
      }

      if (filters?.dateRange) {
        query = query
          .gte('due_date', filters.dateRange.start.toISOString())
          .lte('due_date', filters.dateRange.end.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('crm_tasks')
        .insert([{
          ...taskData,
          created_by: user.id,
          assigned_to: taskData.assigned_to || user.id
        }])
        .select(`
          *,
          contact:crm_contacts(id, company_name, contact_name),
          opportunity:crm_opportunities(id, title),
          assigned_to_profile:profiles!crm_tasks_assigned_to_fkey(id, name),
          created_by_profile:profiles!crm_tasks_created_by_fkey(id, name)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-tasks'] });
      toast({
        title: "Sucesso",
        description: "Tarefa criada com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao criar tarefa: " + error.message,
        variant: "destructive",
      });
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, ...taskData }: any) => {
      const { data, error } = await supabase
        .from('crm_tasks')
        .update(taskData)
        .eq('id', id)
        .select(`
          *,
          contact:crm_contacts(id, company_name, contact_name),
          opportunity:crm_opportunities(id, title),
          assigned_to_profile:profiles!crm_tasks_assigned_to_fkey(id, name),
          created_by_profile:profiles!crm_tasks_created_by_fkey(id, name)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-tasks'] });
      toast({
        title: "Sucesso",
        description: "Tarefa atualizada com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar tarefa: " + error.message,
        variant: "destructive",
      });
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('crm_tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      return taskId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-tasks'] });
      toast({
        title: "Sucesso",
        description: "Tarefa excluída com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao excluir tarefa: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Get overdue tasks
  const overdueTasks = tasks?.filter(task => 
    task.status !== 'concluida' && 
    task.status !== 'cancelada' && 
    new Date(task.due_date) < new Date()
  ) || [];

  // Get today's tasks
  const todaysTasks = tasks?.filter(task => {
    const taskDate = new Date(task.due_date).toDateString();
    const today = new Date().toDateString();
    return taskDate === today && task.status !== 'concluida' && task.status !== 'cancelada';
  }) || [];

  // Get upcoming tasks (next 7 days)
  const upcomingTasks = tasks?.filter(task => {
    const taskDate = new Date(task.due_date);
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    return taskDate > today && 
           taskDate <= nextWeek && 
           task.status !== 'concluida' && 
           task.status !== 'cancelada';
  }) || [];

  return {
    tasks,
    isLoading,
    overdueTasks,
    todaysTasks,
    upcomingTasks,
    createTask: createTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending
  };
};