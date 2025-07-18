
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List
from datetime import date, timedelta
from decimal import Decimal
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.models.financial import AccountsPayable, CashFlow, CashFlowType
from app.schemas.financial import (
    AccountsPayableCreate, AccountsPayableResponse,
    CashFlowCreate, CashFlowResponse,
    CashFlowProjectionItem
)

router = APIRouter(prefix="/financial", tags=["Financial"])

@router.get("/accounts-payable", response_model=List[AccountsPayableResponse])
async def get_accounts_payable(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    payables = db.query(AccountsPayable).order_by(AccountsPayable.due_date).all()
    return payables

@router.post("/accounts-payable", response_model=AccountsPayableResponse)
async def create_accounts_payable(
    payable_data: AccountsPayableCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Calculate amount in BRL
    amount_brl = payable_data.amount * (payable_data.exchange_rate or Decimal("1.0"))
    
    payable = AccountsPayable(
        **payable_data.dict(),
        amount_brl=amount_brl,
        created_by=current_user.id
    )
    
    db.add(payable)
    db.commit()
    db.refresh(payable)
    
    # Create corresponding cash flow entry
    cash_flow = CashFlow(
        flow_date=payable.due_date,
        flow_type=CashFlowType.SAIDA,
        origin="fornecedores",
        amount=payable.amount,
        currency=payable.currency,
        exchange_rate=payable.exchange_rate,
        amount_brl=amount_brl,
        description=f"Pagamento para {payable.supplier_name}",
        reference_id=payable.id,
        reference_type="accounts_payable",
        created_by=current_user.id
    )
    
    db.add(cash_flow)
    db.commit()
    
    return payable

@router.get("/cash-flow", response_model=List[CashFlowResponse])
async def get_cash_flow(
    start_date: date = None,
    end_date: date = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(CashFlow)
    
    if start_date:
        query = query.filter(CashFlow.flow_date >= start_date)
    if end_date:
        query = query.filter(CashFlow.flow_date <= end_date)
    
    flows = query.order_by(CashFlow.flow_date).all()
    return flows

@router.post("/cash-flow", response_model=CashFlowResponse)
async def create_cash_flow(
    flow_data: CashFlowCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Calculate amount in BRL
    amount_brl = flow_data.amount * Decimal("1.0")  # Simplified for now
    
    cash_flow = CashFlow(
        **flow_data.dict(),
        amount_brl=amount_brl,
        created_by=current_user.id
    )
    
    db.add(cash_flow)
    db.commit()
    db.refresh(cash_flow)
    
    return cash_flow

@router.get("/cash-flow-projection", response_model=List[CashFlowProjectionItem])
async def get_cash_flow_projection(
    days_ahead: int = 60,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate cash flow projection for the specified number of days
    """
    projection_data = []
    start_date = date.today()
    accumulated_balance = Decimal("0.0")
    
    for i in range(days_ahead):
        current_date = start_date + timedelta(days=i)
        
        # Get flows for this date
        daily_flows = db.query(CashFlow).filter(
            CashFlow.flow_date == current_date
        ).all()
        
        total_inflow = sum(
            flow.amount_brl or Decimal("0.0") 
            for flow in daily_flows 
            if flow.flow_type == CashFlowType.ENTRADA
        )
        
        total_outflow = sum(
            flow.amount_brl or Decimal("0.0") 
            for flow in daily_flows 
            if flow.flow_type == CashFlowType.SAIDA
        )
        
        net_flow = total_inflow - total_outflow
        accumulated_balance += net_flow
        
        projection_data.append(CashFlowProjectionItem(
            projection_date=current_date.isoformat(),
            total_inflow=total_inflow,
            total_outflow=total_outflow,
            net_flow=net_flow,
            accumulated_balance=accumulated_balance
        ))
    
    return projection_data
