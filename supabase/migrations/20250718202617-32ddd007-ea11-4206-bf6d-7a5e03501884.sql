
-- Criar bucket para documentos financeiros
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'financial-documents',
  'financial-documents',
  false,
  10485760,
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
);

-- Políticas para o bucket de documentos financeiros
CREATE POLICY "Authenticated users can upload financial documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'financial-documents' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can view financial documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'financial-documents' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete financial documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'financial-documents' AND
  auth.role() = 'authenticated'
);

-- Função para sincronizar fluxo de caixa automaticamente
CREATE OR REPLACE FUNCTION sync_cash_flow_from_accounts()
RETURNS TRIGGER AS $$
BEGIN
  -- Para contas a pagar (saída de caixa)
  IF TG_TABLE_NAME = 'accounts_payable' THEN
    IF TG_OP = 'INSERT' THEN
      INSERT INTO cash_flow (
        flow_date,
        description,
        flow_type,
        origin,
        amount,
        amount_brl,
        currency,
        exchange_rate,
        status,
        reference_id,
        reference_type,
        created_by
      ) VALUES (
        NEW.due_date,
        'Conta a pagar: ' || NEW.supplier_name || COALESCE(' - ' || NEW.invoice_number, ''),
        'saida',
        'contas_pagar',
        NEW.amount,
        NEW.amount_brl,
        NEW.currency,
        NEW.exchange_rate,
        NEW.status,
        NEW.id,
        'accounts_payable',
        NEW.created_by
      );
    ELSIF TG_OP = 'UPDATE' THEN
      UPDATE cash_flow SET
        flow_date = NEW.due_date,
        description = 'Conta a pagar: ' || NEW.supplier_name || COALESCE(' - ' || NEW.invoice_number, ''),
        amount = NEW.amount,
        amount_brl = NEW.amount_brl,
        currency = NEW.currency,
        exchange_rate = NEW.exchange_rate,
        status = NEW.status
      WHERE reference_id = NEW.id AND reference_type = 'accounts_payable';
    ELSIF TG_OP = 'DELETE' THEN
      DELETE FROM cash_flow WHERE reference_id = OLD.id AND reference_type = 'accounts_payable';
    END IF;
  END IF;

  -- Para contas a receber (entrada de caixa)
  IF TG_TABLE_NAME = 'accounts_receivable' THEN
    IF TG_OP = 'INSERT' THEN
      INSERT INTO cash_flow (
        flow_date,
        description,
        flow_type,
        origin,
        amount,
        amount_brl,
        currency,
        exchange_rate,
        status,
        reference_id,
        reference_type,
        created_by
      ) VALUES (
        NEW.due_date,
        'Conta a receber: ' || NEW.client_name || COALESCE(' - ' || NEW.invoice_number, ''),
        'entrada',
        'contas_receber',
        NEW.amount,
        NEW.amount_brl,
        NEW.currency,
        NEW.exchange_rate,
        NEW.status,
        NEW.id,
        'accounts_receivable',
        NEW.created_by
      );
    ELSIF TG_OP = 'UPDATE' THEN
      UPDATE cash_flow SET
        flow_date = NEW.due_date,
        description = 'Conta a receber: ' || NEW.client_name || COALESCE(' - ' || NEW.invoice_number, ''),
        amount = NEW.amount,
        amount_brl = NEW.amount_brl,
        currency = NEW.currency,
        exchange_rate = NEW.exchange_rate,
        status = NEW.status
      WHERE reference_id = NEW.id AND reference_type = 'accounts_receivable';
    ELSIF TG_OP = 'DELETE' THEN
      DELETE FROM cash_flow WHERE reference_id = OLD.id AND reference_type = 'accounts_receivable';
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers para sincronização automática
CREATE TRIGGER sync_cash_flow_accounts_payable
  AFTER INSERT OR UPDATE OR DELETE ON accounts_payable
  FOR EACH ROW EXECUTE FUNCTION sync_cash_flow_from_accounts();

CREATE TRIGGER sync_cash_flow_accounts_receivable
  AFTER INSERT OR UPDATE OR DELETE ON accounts_receivable
  FOR EACH ROW EXECUTE FUNCTION sync_cash_flow_from_accounts();

-- Função para projeção de fluxo de caixa
CREATE OR REPLACE FUNCTION get_cash_flow_projection(days_ahead INTEGER DEFAULT 60)
RETURNS TABLE (
  projection_date DATE,
  total_inflow NUMERIC,
  total_outflow NUMERIC,
  net_flow NUMERIC,
  accumulated_balance NUMERIC
) AS $$
DECLARE
  current_date DATE := CURRENT_DATE;
  end_date DATE := CURRENT_DATE + INTERVAL '1 day' * days_ahead;
  running_balance NUMERIC := 0;
  daily_date DATE;
BEGIN
  -- Calcular saldo atual (opcional - pode ser parametrizado)
  SELECT COALESCE(SUM(
    CASE 
      WHEN cf.flow_type = 'entrada' THEN cf.amount_brl
      WHEN cf.flow_type = 'saida' THEN -cf.amount_brl
      ELSE 0
    END
  ), 0) INTO running_balance
  FROM cash_flow cf 
  WHERE cf.flow_date < current_date AND cf.status = 'realizado';
  
  -- Loop através de cada dia
  FOR daily_date IN SELECT generate_series(current_date, end_date, '1 day'::interval)::date LOOP
    SELECT 
      daily_date,
      COALESCE(SUM(CASE WHEN cf.flow_type = 'entrada' THEN cf.amount_brl ELSE 0 END), 0),
      COALESCE(SUM(CASE WHEN cf.flow_type = 'saida' THEN cf.amount_brl ELSE 0 END), 0),
      COALESCE(SUM(
        CASE 
          WHEN cf.flow_type = 'entrada' THEN cf.amount_brl
          WHEN cf.flow_type = 'saida' THEN -cf.amount_brl
          ELSE 0
        END
      ), 0)
    INTO projection_date, total_inflow, total_outflow, net_flow
    FROM cash_flow cf 
    WHERE cf.flow_date = daily_date;
    
    running_balance := running_balance + net_flow;
    accumulated_balance := running_balance;
    
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Inserir dados de exemplo para teste
INSERT INTO accounts_payable (
  supplier_name, invoice_number, issue_date, due_date, amount, currency, 
  amount_brl, exchange_rate, status, payment_method, notes, created_by
) VALUES 
(
  'Fornecedor Exemplo 1', 'NF-001', CURRENT_DATE, CURRENT_DATE + 15, 
  1000.00, 'BRL', 1000.00, 1.0, 'previsto', 'boleto', 
  'Conta de exemplo para teste', (SELECT id FROM profiles LIMIT 1)
),
(
  'Fornecedor Exemplo 2', 'NF-002', CURRENT_DATE, CURRENT_DATE + 30, 
  5000.00, 'BRL', 5000.00, 1.0, 'previsto', 'transferencia', 
  'Segunda conta de exemplo', (SELECT id FROM profiles LIMIT 1)
);

INSERT INTO accounts_receivable (
  client_name, invoice_number, issue_date, due_date, amount, currency,
  amount_brl, exchange_rate, status, payment_method, notes, created_by
) VALUES 
(
  'Cliente Exemplo 1', 'FAT-001', CURRENT_DATE, CURRENT_DATE + 10,
  15000.00, 'BRL', 15000.00, 1.0, 'previsto', 'transferencia',
  'Faturamento de exemplo', (SELECT id FROM profiles LIMIT 1)
),
(
  'Cliente Exemplo 2', 'FAT-002', CURRENT_DATE, CURRENT_DATE + 20,
  8000.00, 'BRL', 8000.00, 1.0, 'previsto', 'boleto',
  'Segunda fatura de exemplo', (SELECT id FROM profiles LIMIT 1)
);

-- Inserir exemplo de ACC
INSERT INTO acc_contracts (
  contract_number, bank_name, bank_code, contract_date, maturity_date,
  amount_usd, exchange_rate, amount_brl, interest_rate, advance_percentage,
  advance_amount_usd, status, notes, created_by
) VALUES (
  'ACC-2024-001', 'Banco Exemplo', '001', CURRENT_DATE, CURRENT_DATE + 180,
  100000.00, 5.20, 520000.00, 12.50, 80.00, 80000.00, 'aberto',
  'Contrato ACC de exemplo para teste', (SELECT id FROM profiles LIMIT 1)
);
