
from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from datetime import date, datetime
from decimal import Decimal
from app.models.crm import ContactStatus, BusinessSegment, InteractionType, ProposalStatus

class CrmContactBase(BaseModel):
    company_name: str
    contact_name: str
    email: EmailStr
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    country: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    segment: BusinessSegment = BusinessSegment.OUTROS
    general_notes: Optional[str] = None

class CrmContactCreate(CrmContactBase):
    pass

class CrmContactResponse(CrmContactBase):
    id: UUID
    status: ContactStatus
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class CommercialProposalBase(BaseModel):
    contact_id: UUID
    product_name: str
    product_description: Optional[str] = None
    total_weight_kg: Optional[Decimal] = None
    unit_price: Optional[Decimal] = None
    total_value: Optional[Decimal] = None
    currency: str = "USD"
    incoterm: Optional[str] = None
    delivery_time_days: Optional[int] = None
    port_of_origin: Optional[str] = None
    port_of_destination: Optional[str] = None
    payment_terms: Optional[str] = None
    validity_days: int = 30
    notes: Optional[str] = None

class CommercialProposalCreate(CommercialProposalBase):
    pass

class CommercialProposalResponse(CommercialProposalBase):
    id: UUID
    proposal_number: str
    status: ProposalStatus
    language: str
    pdf_file_path: Optional[str]
    expires_at: Optional[datetime]
    created_at: datetime
    contact: Optional[CrmContactResponse] = None
    
    class Config:
        from_attributes = True

class InteractionBase(BaseModel):
    contact_id: UUID
    interaction_type: InteractionType
    feedback: str
    result: Optional[str] = None
    next_action_date: Optional[date] = None
    next_action_description: Optional[str] = None

class InteractionCreate(InteractionBase):
    pass

class InteractionResponse(InteractionBase):
    id: UUID
    interaction_date: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True
