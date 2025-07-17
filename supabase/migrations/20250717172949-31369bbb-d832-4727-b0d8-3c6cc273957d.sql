-- Criar tabela para armazenar tokens do Google Calendar
CREATE TABLE public.user_google_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  scope TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_google_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own Google tokens" 
ON public.user_google_tokens 
FOR ALL 
USING (auth.uid() = user_id);

-- Add trigger for timestamps
CREATE TRIGGER update_user_google_tokens_updated_at
BEFORE UPDATE ON public.user_google_tokens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir dados de exemplo para demonstração
-- Primeiro, verificar se existem usuários para associar os dados
DO $$
DECLARE
    demo_user_id UUID;
    contact1_id UUID;
    contact2_id UUID;
    contact3_id UUID;
    task1_id UUID;
    task2_id UUID;
    task3_id UUID;
    task4_id UUID;
BEGIN
    -- Pegar o primeiro usuário existente ou criar um demo se não existir
    SELECT id INTO demo_user_id FROM auth.users LIMIT 1;
    
    IF demo_user_id IS NULL THEN
        -- Se não há usuários, não inserir dados de exemplo
        RAISE NOTICE 'Nenhum usuário encontrado. Dados de exemplo não foram inseridos.';
        RETURN;
    END IF;

    -- Inserir contatos de exemplo
    INSERT INTO public.crm_contacts (id, company_name, contact_name, email, phone, whatsapp, status, segment, city, state, country, created_by, assigned_to, general_notes)
    VALUES 
        (gen_random_uuid(), 'TechCorp Brasil', 'João Silva', 'joao@techcorp.com.br', '+55 11 99999-1234', '+55 11 99999-1234', 'ativo', 'industria', 'São Paulo', 'SP', 'Brasil', demo_user_id, demo_user_id, 'Cliente interessado em frutas orgânicas para linha premium'),
        (gen_random_uuid(), 'FreshMarket Ltd', 'Maria Santos', 'maria@freshmarket.com', '+55 21 88888-5678', '+55 21 88888-5678', 'ativo', 'distribuidor', 'Rio de Janeiro', 'RJ', 'Brasil', demo_user_id, demo_user_id, 'Distribuidor atacadista com foco em produtos sustentáveis'),
        (gen_random_uuid(), 'Global Foods Inc', 'Robert Johnson', 'robert@globalfoods.com', '+1 555-123-4567', NULL, 'em_negociacao', 'importador', 'Miami', 'FL', 'Estados Unidos', demo_user_id, demo_user_id, 'Importador americano interessado em aumentar volume de compras')
    RETURNING id INTO contact1_id;

    -- Pegar os IDs dos contatos inseridos
    SELECT id INTO contact1_id FROM public.crm_contacts WHERE email = 'joao@techcorp.com.br';
    SELECT id INTO contact2_id FROM public.crm_contacts WHERE email = 'maria@freshmarket.com';
    SELECT id INTO contact3_id FROM public.crm_contacts WHERE email = 'robert@globalfoods.com';

    -- Inserir interações de exemplo
    INSERT INTO public.crm_interactions (contact_id, interaction_type, feedback, result, interaction_date, next_action_date, next_action_description, created_by)
    VALUES 
        (contact1_id, 'ligacao', 'Cliente demonstrou interesse em nossos produtos orgânicos. Solicitou proposta para 500kg de manga tommy.', 'proposta_enviada', NOW() - INTERVAL '2 days', CURRENT_DATE + INTERVAL '3 days', 'Follow-up para confirmar recebimento da proposta', demo_user_id),
        (contact1_id, 'email', 'Enviada proposta comercial detalhada com preços e condições de pagamento.', 'follow_up', NOW() - INTERVAL '1 day', CURRENT_DATE + INTERVAL '1 day', 'Ligação para esclarecer dúvidas', demo_user_id),
        (contact2_id, 'reuniao', 'Reunião muito produtiva. Cliente quer iniciar com pedido teste de 200kg de abacate.', 'sucesso', NOW() - INTERVAL '3 days', CURRENT_DATE + INTERVAL '5 days', 'Preparar contrato piloto', demo_user_id),
        (contact2_id, 'whatsapp', 'Cliente confirmou interesse e pediu para acelerar processo de aprovação.', 'agendamento', NOW() - INTERVAL '1 hour', CURRENT_DATE + INTERVAL '2 days', 'Agendar visita técnica', demo_user_id),
        (contact3_id, 'email', 'Primeiro contato estabelecido. Cliente interessado em conhecer nossa operação.', 'agendamento', NOW() - INTERVAL '5 days', CURRENT_DATE + INTERVAL '7 days', 'Agendar reunião presencial', demo_user_id);

    -- Inserir oportunidades de exemplo
    INSERT INTO public.crm_opportunities (contact_id, title, description, estimated_value, currency, stage, probability, expected_close_date, product_interest, created_by, assigned_to)
    VALUES 
        (contact1_id, 'Fornecimento Manga Tommy 500kg/mês', 'Oportunidade de fornecimento regular de manga tommy orgânica para linha premium da TechCorp', 25000.00, 'BRL', 'proposta', 75, CURRENT_DATE + INTERVAL '15 days', 'Manga Tommy Orgânica', demo_user_id, demo_user_id),
        (contact2_id, 'Contrato Piloto Abacate', 'Teste inicial com 200kg de abacate para avaliação de qualidade e logística', 8000.00, 'BRL', 'negociacao', 80, CURRENT_DATE + INTERVAL '10 days', 'Abacate Fortuna', demo_user_id, demo_user_id),
        (contact3_id, 'Expansão Mercado Americano', 'Oportunidade de entrada no mercado americano com volumes significativos', 150000.00, 'USD', 'contato_inicial', 35, CURRENT_DATE + INTERVAL '45 days', 'Mix de frutas tropicais', demo_user_id, demo_user_id);

    -- Inserir tarefas de exemplo
    INSERT INTO public.crm_tasks (title, description, task_type, status, due_date, reminder_date, contact_id, assigned_to, created_by)
    VALUES 
        ('Ligar para TechCorp - Follow-up Proposta', 'Verificar se receberam a proposta e esclarecer eventuais dúvidas sobre preços e condições', 'ligacao', 'pendente', CURRENT_DATE + INTERVAL '1 day' + INTERVAL '14 hours', CURRENT_DATE + INTERVAL '1 day' + INTERVAL '13 hours', contact1_id, demo_user_id, demo_user_id),
        ('Preparar contrato piloto FreshMarket', 'Elaborar minuta de contrato para fornecimento teste de 200kg de abacate', 'outros', 'em_andamento', CURRENT_DATE + INTERVAL '3 days', CURRENT_DATE + INTERVAL '2 days' + INTERVAL '9 hours', contact2_id, demo_user_id, demo_user_id),
        ('Reunião com Global Foods', 'Reunião presencial para apresentar capacidade produtiva e discutir volumes', 'reuniao', 'pendente', CURRENT_DATE + INTERVAL '7 days' + INTERVAL '10 hours', CURRENT_DATE + INTERVAL '6 days' + INTERVAL '18 hours', contact3_id, demo_user_id, demo_user_id),
        ('Enviar certificações para TechCorp', 'Enviar cópias dos certificados orgânicos e de qualidade solicitados', 'email', 'pendente', CURRENT_DATE + INTERVAL '2 days', CURRENT_DATE + INTERVAL '1 day' + INTERVAL '16 hours', contact1_id, demo_user_id, demo_user_id),
        ('Visita técnica FreshMarket', 'Agendar e realizar visita às instalações do cliente para alinhamento técnico', 'visita', 'pendente', CURRENT_DATE + INTERVAL '5 days' + INTERVAL '15 hours', CURRENT_DATE + INTERVAL '4 days' + INTERVAL '10 hours', contact2_id, demo_user_id, demo_user_id);

    RAISE NOTICE 'Dados de exemplo inseridos com sucesso para o usuário: %', demo_user_id;
END $$;