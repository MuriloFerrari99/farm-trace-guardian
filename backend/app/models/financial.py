
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Enum, Numeric, Date, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from app.core.database import Base

class CurrencyCode(str, enum.Enum):
    BRL = "BRL"
    USD = "USD"
    EUR = "EUR"
    ARS = "ARS"

class TransactionStatus(str, enum.Enum):
    PREVISTO = "previsto"
    REALIZADO = "realizado"
    CANCELADO = "cancelado"

class CashFlowType(str, enum.Enum):
    ENTRADA = "entrada"
    SAIDA = "saida"

class CashFlowOrigin(str, enum.Enum):
    VENDAS = "vendas"
    ACC = "acc"
    LC = "lc"
    EMPRESTIMO = "emprestimo"
    CAPITAL = "capital"
    OUTROS = "outros"

class PaymentMethod(str, enum.Enum):
    BOLETO = "boleto"
    TRANSFERENCIA = "transferencia"
    CHEQUE = "cheque"
    CARTAO = "cartao"
    PIX = "pix"
    SWIFT = "swift"

class AccountType(str, enum.Enum):
    RECEITA = "receita"
    CUSTO = "custo"
    DESPESA = "despesa"
    ATIVO = "ativo"
    PASSIVO = "passivo"
    PATRIMONIO = "patrimonio"

class ChartOfAccounts(Base):
    __tablename__ = "chart_of_accounts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    account_code = Column(String, unique=True, nullable=False)
    account_name = Column(String, nullable=False)
    account_type = Column(Enum(AccountType), nullable=False)
    parent_account_id = Column(UUID(as_uuid=True), ForeignKey("chart_of_accounts.id"))
    is_active = Column(Boolean, default=True)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class AccountsPayable(Base):
    __tablename__ = "accounts_payable"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    invoice_number = Column(String)
    supplier_name = Column(String, nullable=False)
    supplier_document = Column(String)
    issue_date = Column(Date, nullable=False)
    due_date = Column(Date, nullable=False)
    amount = Column(Numeric(15, 2), nullable=False)
    currency = Column(Enum(CurrencyCode), default=CurrencyCode.BRL)
    exchange_rate = Column(Numeric(10, 6), default=1.0)
    amount_brl = Column(Numeric(15, 2))
    payment_method = Column(Enum(PaymentMethod))
    status = Column(Enum(TransactionStatus), default=TransactionStatus.PREVISTO)
    payment_date = Column(Date)
    amount_paid = Column(Numeric(15, 2), default=0)
    discount_amount = Column(Numeric(15, 2), default=0)
    interest_amount = Column(Numeric(15, 2), default=0)
    notes = Column(Text)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class AccountsReceivable(Base):
    __tablename__ = "accounts_receivable"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    invoice_number = Column(String, nullable=False)
    client_name = Column(String, nullable=False)
    client_document = Column(String)
    issue_date = Column(Date, nullable=False)
    due_date = Column(Date, nullable=False)
    amount = Column(Numeric(15, 2), nullable=False)
    currency = Column(Enum(CurrencyCode), default=CurrencyCode.BRL)
    exchange_rate = Column(Numeric(10, 6), default=1.0)
    amount_brl = Column(Numeric(15, 2))
    payment_method = Column(Enum(PaymentMethod))
    status = Column(Enum(TransactionStatus), default=TransactionStatus.PREVISTO)
    payment_date = Column(Date)
    amount_paid = Column(Numeric(15, 2), default=0)
    discount_amount = Column(Numeric(15, 2), default=0)
    interest_amount = Column(Numeric(15, 2), default=0)
    notes = Column(Text)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class CashFlow(Base):
    __tablename__ = "cash_flow"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    flow_date = Column(Date, nullable=False)
    flow_type = Column(Enum(CashFlowType), nullable=False)
    origin = Column(Enum(CashFlowOrigin), nullable=False)
    amount = Column(Numeric(15, 2), nullable=False)
    currency = Column(Enum(CurrencyCode), default=CurrencyCode.BRL)
    exchange_rate = Column(Numeric(10, 6), default=1.0)
    amount_brl = Column(Numeric(15, 2))
    description = Column(Text, nullable=False)
    status = Column(Enum(TransactionStatus), default=TransactionStatus.PREVISTO)
    reference_id = Column(UUID(as_uuid=True))
    reference_type = Column(String)
    client_id = Column(UUID(as_uuid=True))
    bank_account = Column(String)
    notes = Column(Text)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class FinancialDocument(Base):
    __tablename__ = "financial_documents"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_type = Column(String, nullable=False)
    document_number = Column(String)
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(String)
    mime_type = Column(String)
    reference_id = Column(UUID(as_uuid=True), nullable=False)
    reference_type = Column(String, nullable=False)
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
