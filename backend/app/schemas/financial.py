
from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import date, datetime
from decimal import Decimal
from app.models.financial import CurrencyCode, TransactionStatus, CashFlowType, PaymentMethod

class AccountsPayableBase(BaseModel):
    supplier_name: str
    supplier_document: Optional[str] = None
    issue_date: date
    due_date: date
    amount: Decimal
    currency: CurrencyCode = CurrencyCode.BRL
    exchange_rate: Optional[Decimal] = Decimal("1.0")
    payment_method: Optional[PaymentMethod] = None
    notes: Optional[str] = None

class AccountsPayableCreate(AccountsPayableBase):
    invoice_number: Optional[str] = None

class AccountsPayableResponse(AccountsPayableBase):
    id: UUID
    invoice_number: Optional[str]
    amount_brl: Optional[Decimal]
    status: TransactionStatus
    payment_date: Optional[date]
    amount_paid: Decimal
    created_at: datetime
    
    class Config:
        from_attributes = True

class CashFlowBase(BaseModel):
    flow_date: date
    flow_type: CashFlowType
    amount: Decimal
    currency: CurrencyCode = CurrencyCode.BRL
    description: str
    reference_type: Optional[str] = None
    notes: Optional[str] = None

class CashFlowCreate(CashFlowBase):
    origin: str

class CashFlowResponse(CashFlowBase):
    id: UUID
    amount_brl: Optional[Decimal]
    status: TransactionStatus
    reference_id: Optional[UUID]
    created_at: datetime
    
    class Config:
        from_attributes = True

class CashFlowProjectionItem(BaseModel):
    projection_date: str
    total_inflow: Decimal
    total_outflow: Decimal
    net_flow: Decimal
    accumulated_balance: Decimal
