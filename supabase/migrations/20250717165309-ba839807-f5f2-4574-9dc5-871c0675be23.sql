-- Create enum for task status
CREATE TYPE public.task_status AS ENUM ('pendente', 'em_andamento', 'concluida', 'cancelada');

-- Create enum for task types
CREATE TYPE public.task_type AS ENUM ('ligacao', 'reuniao', 'email', 'follow_up', 'proposta', 'visita', 'outros');

-- Create crm_tasks table
CREATE TABLE public.crm_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  task_type public.task_type NOT NULL DEFAULT 'outros',
  status public.task_status NOT NULL DEFAULT 'pendente',
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  reminder_date TIMESTAMP WITH TIME ZONE,
  contact_id UUID REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES public.crm_opportunities(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES public.profiles(id) NOT NULL,
  created_by UUID REFERENCES public.profiles(id),
  completed_at TIMESTAMP WITH TIME ZONE,
  google_calendar_event_id TEXT,
  whatsapp_reminder_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.crm_tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for tasks
CREATE POLICY "Users can view assigned tasks and created tasks" 
ON public.crm_tasks 
FOR SELECT 
USING (
  auth.uid() = assigned_to OR 
  auth.uid() = created_by OR 
  is_current_user_admin_or_supervisor()
);

CREATE POLICY "Users can create tasks" 
ON public.crm_tasks 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their assigned tasks or created tasks" 
ON public.crm_tasks 
FOR UPDATE 
USING (
  auth.uid() = assigned_to OR 
  auth.uid() = created_by OR 
  is_current_user_admin_or_supervisor()
);

CREATE POLICY "Users can delete their created tasks" 
ON public.crm_tasks 
FOR DELETE 
USING (
  auth.uid() = created_by OR 
  is_current_user_admin_or_supervisor()
);

-- Create indexes for better performance
CREATE INDEX idx_crm_tasks_assigned_to ON public.crm_tasks(assigned_to);
CREATE INDEX idx_crm_tasks_due_date ON public.crm_tasks(due_date);
CREATE INDEX idx_crm_tasks_status ON public.crm_tasks(status);
CREATE INDEX idx_crm_tasks_contact_id ON public.crm_tasks(contact_id);

-- Create trigger for updated_at
CREATE TRIGGER update_crm_tasks_updated_at
BEFORE UPDATE ON public.crm_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();