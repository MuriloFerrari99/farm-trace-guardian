-- =====================================
-- MÓDULO FINANCEIRO - ESTRUTURA DE DADOS
-- =====================================

-- Enums para tipos de dados financeiros
CREATE TYPE public.account_type AS ENUM ('receita', 'custo', 'despesa', 'ativo', 'passivo', 'patrimonio');
CREATE TYPE public.cost_center_type AS ENUM ('producao', 'comercial', 'administrativo', 'financeiro', 'exportacao');
CREATE TYPE public.cash_flow_type AS ENUM ('entrada', 'saida');
CREATE TYPE public.cash_flow_origin AS ENUM ('vendas', 'acc', 'lc', 'emprestimo', 'capital', 'outros');
CREATE TYPE public.transaction_status AS ENUM ('previsto', 'realizado', 'cancelado');
CREATE TYPE public.payment_method AS ENUM ('boleto', 'transferencia', 'cheque', 'cartao', 'pix', 'swift');
CREATE TYPE public.currency_code AS ENUM ('BRL', 'USD', 'EUR', 'ARS', 'CNY');
CREATE TYPE public.acc_status AS ENUM ('aberto', 'liquidado', 'vencido', 'cancelado');
CREATE TYPE public.lc_status AS ENUM ('emitida', 'confirmada', 'embarcada', 'liberada', 'vencida', 'cancelada');
CREATE TYPE public.insurance_type AS ENUM ('transporte', 'credito', 'cargo', 'responsabilidade_civil');

-- =====================================
-- PLANO DE CONTAS
-- =====================================
CREATE TABLE public.chart_of_accounts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    account_code TEXT NOT NULL UNIQUE,
    account_name TEXT NOT NULL,
    account_type account_type NOT NULL,
    parent_account_id UUID REFERENCES public.chart_of_accounts(id),
    cost_center cost_center_type NOT NULL DEFAULT 'administrativo',
    is_active BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================
-- TRANSAÇÕES FINANCEIRAS (BASE)
-- =====================================
CREATE TABLE public.financial_transactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_date DATE NOT NULL,
    account_id UUID NOT NULL REFERENCES public.chart_of_accounts(id),
    description TEXT NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    currency currency_code DEFAULT 'BRL',
    exchange_rate NUMERIC(10,6) DEFAULT 1.0,
    amount_brl NUMERIC(15,2) GENERATED ALWAYS AS (amount * exchange_rate) STORED,
    cost_center cost_center_type NOT NULL,
    status transaction_status DEFAULT 'realizado',
    reference_document TEXT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================
-- FLUXO DE CAIXA
-- =====================================
CREATE TABLE public.cash_flow (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    flow_date DATE NOT NULL,
    flow_type cash_flow_type NOT NULL,
    origin cash_flow_origin NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    currency currency_code DEFAULT 'BRL',
    exchange_rate NUMERIC(10,6) DEFAULT 1.0,
    amount_brl NUMERIC(15,2) GENERATED ALWAYS AS (amount * exchange_rate) STORED,
    description TEXT NOT NULL,
    status transaction_status DEFAULT 'previsto',
    reference_id UUID, -- Pode referenciar ACC, LC, Expedição, etc.
    reference_type TEXT, -- 'acc', 'lc', 'expedition', 'contract', etc.
    client_id UUID,
    bank_account TEXT,
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================
-- CONTAS A RECEBER
-- =====================================
CREATE TABLE public.accounts_receivable (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_number TEXT NOT NULL,
    client_name TEXT NOT NULL,
    client_document TEXT,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    currency currency_code DEFAULT 'BRL',
    exchange_rate NUMERIC(10,6) DEFAULT 1.0,
    amount_brl NUMERIC(15,2) GENERATED ALWAYS AS (amount * exchange_rate) STORED,
    payment_method payment_method,
    status transaction_status DEFAULT 'previsto',
    payment_date DATE,
    amount_paid NUMERIC(15,2) DEFAULT 0,
    discount_amount NUMERIC(15,2) DEFAULT 0,
    interest_amount NUMERIC(15,2) DEFAULT 0,
    expedition_id UUID REFERENCES public.expeditions(id),
    acc_id UUID, -- Referência para ACC (será criada abaixo)
    lc_id UUID, -- Referência para LC (será criada abaixo)
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================
-- CONTAS A PAGAR
-- =====================================
CREATE TABLE public.accounts_payable (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_number TEXT,
    supplier_name TEXT NOT NULL,
    supplier_document TEXT,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    currency currency_code DEFAULT 'BRL',
    exchange_rate NUMERIC(10,6) DEFAULT 1.0,
    amount_brl NUMERIC(15,2) GENERATED ALWAYS AS (amount * exchange_rate) STORED,
    payment_method payment_method,
    status transaction_status DEFAULT 'previsto',
    payment_date DATE,
    amount_paid NUMERIC(15,2) DEFAULT 0,
    discount_amount NUMERIC(15,2) DEFAULT 0,
    interest_amount NUMERIC(15,2) DEFAULT 0,
    producer_id UUID REFERENCES public.producers(id),
    reception_id UUID REFERENCES public.receptions(id),
    account_id UUID REFERENCES public.chart_of_accounts(id),
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================
-- ACC (ADIANTAMENTO SOBRE CONTRATO DE CÂMBIO)
-- =====================================
CREATE TABLE public.acc_contracts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    contract_number TEXT NOT NULL UNIQUE,
    bank_name TEXT NOT NULL,
    bank_code TEXT,
    contract_date DATE NOT NULL,
    maturity_date DATE NOT NULL,
    amount_usd NUMERIC(15,2) NOT NULL,
    exchange_rate NUMERIC(10,6) NOT NULL,
    amount_brl NUMERIC(15,2) GENERATED ALWAYS AS (amount_usd * exchange_rate) STORED,
    advance_percentage NUMERIC(5,2) DEFAULT 100.00,
    advance_amount_usd NUMERIC(15,2) GENERATED ALWAYS AS (amount_usd * advance_percentage / 100) STORED,
    interest_rate NUMERIC(8,4) NOT NULL,
    iof_rate NUMERIC(6,4) DEFAULT 0.38,
    total_cost NUMERIC(15,2),
    status acc_status DEFAULT 'aberto',
    expedition_id UUID REFERENCES public.expeditions(id),
    producer_id UUID REFERENCES public.producers(id),
    liquidation_date DATE,
    liquidation_rate NUMERIC(10,6),
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================
-- CARTA DE CRÉDITO (LC)
-- =====================================
CREATE TABLE public.letter_of_credit (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    lc_number TEXT NOT NULL UNIQUE,
    issuing_bank TEXT NOT NULL,
    confirming_bank TEXT,
    beneficiary TEXT NOT NULL,
    applicant TEXT NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    currency currency_code DEFAULT 'USD',
    issue_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    latest_shipment_date DATE,
    port_of_loading TEXT,
    port_of_discharge TEXT,
    description_of_goods TEXT,
    status lc_status DEFAULT 'emitida',
    expedition_id UUID REFERENCES public.expeditions(id),
    confirmation_date DATE,
    shipment_date DATE,
    presentation_date DATE,
    negotiation_date DATE,
    discrepancies TEXT,
    payment_terms TEXT,
    partial_shipment BOOLEAN DEFAULT false,
    transshipment BOOLEAN DEFAULT false,
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================
-- SEGUROS DE EXPORTAÇÃO
-- =====================================
CREATE TABLE public.export_insurance (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    policy_number TEXT NOT NULL,
    insurance_company TEXT NOT NULL,
    insurance_type insurance_type NOT NULL,
    premium_amount NUMERIC(15,2) NOT NULL,
    coverage_amount NUMERIC(15,2) NOT NULL,
    currency currency_code DEFAULT 'USD',
    policy_start_date DATE NOT NULL,
    policy_end_date DATE NOT NULL,
    deductible_amount NUMERIC(15,2) DEFAULT 0,
    expedition_id UUID REFERENCES public.expeditions(id),
    lc_id UUID REFERENCES public.letter_of_credit(id),
    cargo_description TEXT,
    route_origin TEXT,
    route_destination TEXT,
    vessel_name TEXT,
    bill_of_lading TEXT,
    claim_status TEXT,
    claim_date DATE,
    claim_amount NUMERIC(15,2),
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================
-- DOCUMENTOS FINANCEIROS
-- =====================================
CREATE TABLE public.financial_documents (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    document_type TEXT NOT NULL,
    document_number TEXT,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    reference_id UUID NOT NULL, -- Pode referenciar ACC, LC, Insurance, etc.
    reference_type TEXT NOT NULL, -- 'acc', 'lc', 'insurance', 'receivable', 'payable'
    uploaded_by UUID REFERENCES public.profiles(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================
-- FOREIGN KEYS ADICIONAIS
-- =====================================
ALTER TABLE public.accounts_receivable 
ADD CONSTRAINT fk_accounts_receivable_acc 
FOREIGN KEY (acc_id) REFERENCES public.acc_contracts(id);

ALTER TABLE public.accounts_receivable 
ADD CONSTRAINT fk_accounts_receivable_lc 
FOREIGN KEY (lc_id) REFERENCES public.letter_of_credit(id);

-- =====================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================
CREATE INDEX idx_financial_transactions_date ON public.financial_transactions(transaction_date);
CREATE INDEX idx_financial_transactions_account ON public.financial_transactions(account_id);
CREATE INDEX idx_cash_flow_date ON public.cash_flow(flow_date);
CREATE INDEX idx_cash_flow_reference ON public.cash_flow(reference_id, reference_type);
CREATE INDEX idx_accounts_receivable_due_date ON public.accounts_receivable(due_date);
CREATE INDEX idx_accounts_receivable_client ON public.accounts_receivable(client_name);
CREATE INDEX idx_accounts_payable_due_date ON public.accounts_payable(due_date);
CREATE INDEX idx_accounts_payable_supplier ON public.accounts_payable(supplier_name);
CREATE INDEX idx_acc_contracts_maturity ON public.acc_contracts(maturity_date);
CREATE INDEX idx_lc_expiry ON public.letter_of_credit(expiry_date);
CREATE INDEX idx_insurance_policy_dates ON public.export_insurance(policy_start_date, policy_end_date);

-- =====================================
-- RLS POLICIES
-- =====================================
ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_flow ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts_receivable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts_payable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acc_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.letter_of_credit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.export_insurance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_documents ENABLE ROW LEVEL SECURITY;

-- Políticas para authenticated users
CREATE POLICY "Authenticated users can view chart of accounts" ON public.chart_of_accounts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage chart of accounts" ON public.chart_of_accounts FOR ALL USING (true);

CREATE POLICY "Authenticated users can view financial transactions" ON public.financial_transactions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage financial transactions" ON public.financial_transactions FOR ALL USING (true);

CREATE POLICY "Authenticated users can view cash flow" ON public.cash_flow FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage cash flow" ON public.cash_flow FOR ALL USING (true);

CREATE POLICY "Authenticated users can view accounts receivable" ON public.accounts_receivable FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage accounts receivable" ON public.accounts_receivable FOR ALL USING (true);

CREATE POLICY "Authenticated users can view accounts payable" ON public.accounts_payable FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage accounts payable" ON public.accounts_payable FOR ALL USING (true);

CREATE POLICY "Authenticated users can view ACC contracts" ON public.acc_contracts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage ACC contracts" ON public.acc_contracts FOR ALL USING (true);

CREATE POLICY "Authenticated users can view letter of credit" ON public.letter_of_credit FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage letter of credit" ON public.letter_of_credit FOR ALL USING (true);

CREATE POLICY "Authenticated users can view export insurance" ON public.export_insurance FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage export insurance" ON public.export_insurance FOR ALL USING (true);

CREATE POLICY "Authenticated users can view financial documents" ON public.financial_documents FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage financial documents" ON public.financial_documents FOR ALL USING (true);

-- =====================================
-- TRIGGERS PARA UPDATED_AT
-- =====================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_chart_of_accounts_updated_at BEFORE UPDATE ON public.chart_of_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_financial_transactions_updated_at BEFORE UPDATE ON public.financial_transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cash_flow_updated_at BEFORE UPDATE ON public.cash_flow FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_accounts_receivable_updated_at BEFORE UPDATE ON public.accounts_receivable FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_accounts_payable_updated_at BEFORE UPDATE ON public.accounts_payable FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_acc_contracts_updated_at BEFORE UPDATE ON public.acc_contracts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_letter_of_credit_updated_at BEFORE UPDATE ON public.letter_of_credit FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_export_insurance_updated_at BEFORE UPDATE ON public.export_insurance FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();