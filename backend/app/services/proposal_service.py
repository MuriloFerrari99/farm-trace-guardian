
from datetime import datetime
import uuid

def generate_proposal_number() -> str:
    """Generate a unique proposal number"""
    timestamp = datetime.now().strftime("%Y%m%d")
    short_uuid = str(uuid.uuid4())[:8].upper()
    return f"PROP-{timestamp}-{short_uuid}"

def calculate_proposal_totals(unit_price: float, quantity: float, currency: str = "USD"):
    """Calculate proposal totals with currency conversion if needed"""
    total_value = unit_price * quantity
    
    # Here you could add currency conversion logic
    # For now, returning the basic calculation
    return {
        "total_value": total_value,
        "currency": currency
    }
