
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.models.crm import CrmContact, CrmInteraction, CommercialProposal, ProposalStatus
from app.schemas.crm import (
    CrmContactCreate, CrmContactResponse,
    CommercialProposalCreate, CommercialProposalResponse,
    InteractionCreate, InteractionResponse
)
from app.services.proposal_service import generate_proposal_number

router = APIRouter(prefix="/crm", tags=["CRM"])

@router.get("/contacts", response_model=List[CrmContactResponse])
async def get_contacts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    contacts = db.query(CrmContact).order_by(CrmContact.company_name).all()
    return contacts

@router.post("/contacts", response_model=CrmContactResponse)
async def create_contact(
    contact_data: CrmContactCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if contact exists
    existing = db.query(CrmContact).filter(CrmContact.email == contact_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Contact with this email already exists")
    
    contact = CrmContact(
        **contact_data.dict(),
        created_by=current_user.id,
        assigned_to=current_user.id
    )
    
    db.add(contact)
    db.commit()
    db.refresh(contact)
    
    return contact

@router.get("/proposals", response_model=List[CommercialProposalResponse])
async def get_proposals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    proposals = db.query(CommercialProposal).order_by(
        CommercialProposal.created_at.desc()
    ).all()
    return proposals

@router.post("/proposals", response_model=CommercialProposalResponse)
async def create_proposal(
    proposal_data: CommercialProposalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Generate proposal number
    proposal_number = generate_proposal_number()
    
    # Calculate expiry date
    expires_at = datetime.utcnow() + timedelta(days=proposal_data.validity_days)
    
    proposal = CommercialProposal(
        **proposal_data.dict(),
        proposal_number=proposal_number,
        expires_at=expires_at,
        created_by=current_user.id
    )
    
    db.add(proposal)
    db.commit()
    db.refresh(proposal)
    
    return proposal

@router.put("/proposals/{proposal_id}/status")
async def update_proposal_status(
    proposal_id: str,
    status: ProposalStatus,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    proposal = db.query(CommercialProposal).filter(
        CommercialProposal.id == proposal_id
    ).first()
    
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    
    proposal.status = status
    
    if status == ProposalStatus.ENVIADA:
        proposal.sent_at = datetime.utcnow()
    elif status == ProposalStatus.ACEITA:
        proposal.accepted_at = datetime.utcnow()
    
    db.commit()
    
    return {"message": "Status updated successfully"}

@router.post("/interactions", response_model=InteractionResponse)
async def create_interaction(
    interaction_data: InteractionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    interaction = CrmInteraction(
        **interaction_data.dict(),
        created_by=current_user.id
    )
    
    db.add(interaction)
    db.commit()
    db.refresh(interaction)
    
    return interaction
