from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User, Patient, MedicineOrder, OrderItem, InventoryItem, Pharmacist, OrderStatus
from app.schemas import MedicineOrderCreate, MedicineOrderResponse
from app.auth import require_role

router = APIRouter()

@router.post("/order", response_model=MedicineOrderResponse)
def create_medicine_order(
    order_data: MedicineOrderCreate,
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    
    pharmacist = db.query(Pharmacist).filter(Pharmacist.id == order_data.pharmacist_id).first()
    if not pharmacist:
        raise HTTPException(status_code=404, detail="Pharmacist not found")
    
    # Calculate total and check stock
    total_amount = 0.0
    for item_data in order_data.order_items:
        inventory_item = db.query(InventoryItem).filter(
            InventoryItem.id == item_data.inventory_item_id,
            InventoryItem.pharmacist_id == order_data.pharmacist_id
        ).first()
        
        if not inventory_item:
            raise HTTPException(status_code=404, detail=f"Inventory item {item_data.inventory_item_id} not found")
        
        if inventory_item.stock_quantity < item_data.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for {inventory_item.name}. Available: {inventory_item.stock_quantity}"
            )
        
        total_amount += inventory_item.price * item_data.quantity
    
    # Create order
    order = MedicineOrder(
        patient_id=patient.id,
        pharmacist_id=order_data.pharmacist_id,
        prescription_id=order_data.prescription_id,
        total_amount=total_amount,
        delivery_address=order_data.delivery_address,
        status=OrderStatus.PENDING
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    
    # Create order items and update stock
    for item_data in order_data.order_items:
        inventory_item = db.query(InventoryItem).filter(InventoryItem.id == item_data.inventory_item_id).first()
        order_item = OrderItem(
            order_id=order.id,
            inventory_item_id=item_data.inventory_item_id,
            quantity=item_data.quantity,
            price=inventory_item.price
        )
        db.add(order_item)
        
        # Update stock
        inventory_item.stock_quantity -= item_data.quantity
        db.commit()
    
    return order

@router.get("/orders", response_model=List[MedicineOrderResponse])
def get_patient_orders(
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    
    orders = db.query(MedicineOrder).filter(MedicineOrder.patient_id == patient.id).all()
    return orders

