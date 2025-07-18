
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Enum, Numeric, Date, Text, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from app.core.database import Base

class ContactStatus(str, enum.Enum):
    ATIVO = "ativo"
    DESQUALIFICADO = "desqualificado"
    EM_NEGOCIACAO = "em_negociacao"

class BusinessSegment(str, enum.Enum):
    IMPORTADOR = "importador"
    DISTRIBUIDOR = "distribuidor"
    VAREJO = "varejo"
    ATACADO = "atacado"
    INDUSTRIA = "industria"
    OUTROS = "outros"

class InteractionType(str, enum.Enum):
    LIGACAO = "ligacao"
    REUNIAO = "reuniao"
    EMAIL = "email"
    WHATSAPP = "whatsapp"
    VISITA = "visita"
    OUTROS = "outros"

class InteractionResult(str, enum.Enum):
    SUCESSO = "sucesso"
    FOLLOW_UP = "follow_up"
    SEM_INTERESSE = "sem_interesse"
    PROPOSTA_ENVIADA = "proposta_enviada"
    AGENDAMENTO = "agendamento"
    OUTROS = "outros"

class FunnelStage(str, enum.Enum):
    CONTATO_INICIAL = "contato_inicial"
    QUALIFICADO = "qualificado"
    PROPOSTA_ENVIADA = "proposta_enviada"
    NEGOCIACAO = "negociacao"
    FECHADO_GANHOU = "fechado_ganhou"
    FECHADO_PERDEU = "fechado_perdeu"

class ProposalStatus(str, enum.Enum):
    RASCUNHO = "rascunho"
    ENVIADA = "enviada"
    ACEITA = "aceita"
    REJEITADA = "rejeitada"
    EXPIRADA = "expirada"

class CrmContact(Base):
    __tablename__ = "crm_contacts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_name = Column(String, nullable=False)
    contact_name = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True)
    phone = Column(String)
    whatsapp = Column(String)
    country = Column(String)
    state = Column(String)
    city = Column(String)
    segment = Column(Enum(BusinessSegment), default=BusinessSegment.OUTROS)
    status = Column(Enum(ContactStatus), default=ContactStatus.ATIVO)
    general_notes = Column(Text)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    interactions = relationship("CrmInteraction", back_populates="contact")
    opportunities = relationship("CrmOpportunity", back_populates="contact")
    proposals = relationship("CommercialProposal", back_populates="contact")

class CrmInteraction(Base):
    __tablename__ = "crm_interactions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    contact_id = Column(UUID(as_uuid=True), ForeignKey("crm_contacts.id"))
    interaction_type = Column(Enum(InteractionType), nullable=False)
    interaction_date = Column(DateTime(timezone=True), server_default=func.now())
    feedback = Column(Text, nullable=False)
    result = Column(Enum(InteractionResult))
    next_action_date = Column(Date)
    next_action_description = Column(Text)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    contact = relationship("CrmContact", back_populates="interactions")

class CrmOpportunity(Base):
    __tablename__ = "crm_opportunities"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    contact_id = Column(UUID(as_uuid=True), ForeignKey("crm_contacts.id"))
    title = Column(String, nullable=False)
    description = Column(Text)
    estimated_value = Column(Numeric(15, 2))
    currency = Column(String, default="BRL")
    product_interest = Column(String)
    stage = Column(Enum(FunnelStage), default=FunnelStage.CONTATO_INICIAL)
    probability = Column(Integer, default=50)
    expected_close_date = Column(Date)
    actual_close_date = Column(Date)
    lost_reason = Column(Text)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    contact = relationship("CrmContact", back_populates="opportunities")

class CommercialProposal(Base):
    __tablename__ = "commercial_proposals"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    proposal_number = Column(String, unique=True, nullable=False)
    contact_id = Column(UUID(as_uuid=True), ForeignKey("crm_contacts.id"))
    opportunity_id = Column(UUID(as_uuid=True), ForeignKey("crm_opportunities.id"))
    product_name = Column(String, nullable=False)
    product_description = Column(Text)
    total_weight_kg = Column(Numeric(10, 2))
    unit_price = Column(Numeric(10, 4))
    total_value = Column(Numeric(15, 2))
    currency = Column(String, default="USD")
    incoterm = Column(String)
    delivery_time_days = Column(Integer)
    port_of_origin = Column(String)
    port_of_destination = Column(String)
    payment_terms = Column(Text)
    validity_days = Column(Integer, default=30)
    expires_at = Column(DateTime(timezone=True))
    status = Column(Enum(ProposalStatus), default=ProposalStatus.RASCUNHO)
    language = Column(String, default="pt")
    pdf_file_path = Column(String)
    sent_at = Column(DateTime(timezone=True))
    accepted_at = Column(DateTime(timezone=True))
    notes = Column(Text)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    contact = relationship("CrmContact", back_populates="proposals")
    opportunity = relationship("CrmOpportunity")
