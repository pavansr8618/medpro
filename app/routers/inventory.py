from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User, Pharmacist, InventoryItem
from app.schemas import InventoryItemCreate, InventoryItemResponse
from app.auth import require_role

router = APIRouter()

@router.post("/", response_model=InventoryItemResponse)
def add_inventory_item(
    item_data: InventoryItemCreate,
    current_user: User = Depends(require_role(["pharmacist"])),
    db: Session = Depends(get_db)
):
    pharmacist = db.query(Pharmacist).filter(Pharmacist.user_id == current_user.id).first()
    if not pharmacist:
        raise HTTPException(status_code=404, detail="Pharmacist profile not found")
    
    # Check if barcode already exists
    if item_data.barcode:
        existing = db.query(InventoryItem).filter(
            InventoryItem.barcode == item_data.barcode,
            InventoryItem.pharmacist_id == pharmacist.id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Barcode already exists")
    
    item = InventoryItem(
        pharmacist_id=pharmacist.id,
        **item_data.dict()
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.get("/", response_model=List[InventoryItemResponse])
def get_inventory_items(
    category: str = None,
    low_stock: bool = False,
    current_user: User = Depends(require_role(["pharmacist"])),
    db: Session = Depends(get_db)
):
    pharmacist = db.query(Pharmacist).filter(Pharmacist.user_id == current_user.id).first()
    if not pharmacist:
        raise HTTPException(status_code=404, detail="Pharmacist profile not found")
    
    query = db.query(InventoryItem).filter(InventoryItem.pharmacist_id == pharmacist.id)
    
    if category:
        query = query.filter(InventoryItem.category == category)
    
    if low_stock:
        query = query.filter(InventoryItem.stock_quantity <= InventoryItem.min_stock_level)
    
    return query.all()

@router.get("/barcode/{barcode}", response_model=InventoryItemResponse)
def get_item_by_barcode(
    barcode: str,
    current_user: User = Depends(require_role(["pharmacist"])),
    db: Session = Depends(get_db)
):
    pharmacist = db.query(Pharmacist).filter(Pharmacist.user_id == current_user.id).first()
    if not pharmacist:
        raise HTTPException(status_code=404, detail="Pharmacist profile not found")
    
    item = db.query(InventoryItem).filter(
        InventoryItem.barcode == barcode,
        InventoryItem.pharmacist_id == pharmacist.id
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    return item

@router.put("/{item_id}", response_model=InventoryItemResponse)
def update_inventory_item(
    item_id: int,
    item_data: InventoryItemCreate,
    current_user: User = Depends(require_role(["pharmacist"])),
    db: Session = Depends(get_db)
):
    pharmacist = db.query(Pharmacist).filter(Pharmacist.user_id == current_user.id).first()
    if not pharmacist:
        raise HTTPException(status_code=404, detail="Pharmacist profile not found")
    
    item = db.query(InventoryItem).filter(
        InventoryItem.id == item_id,
        InventoryItem.pharmacist_id == pharmacist.id
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    for key, value in item_data.dict(exclude_unset=True).items():
        setattr(item, key, value)
    
    db.commit()
    db.refresh(item)
    return item

@router.delete("/{item_id}")
def delete_inventory_item(
    item_id: int,
    current_user: User = Depends(require_role(["pharmacist"])),
    db: Session = Depends(get_db)
):
    pharmacist = db.query(Pharmacist).filter(Pharmacist.user_id == current_user.id).first()
    if not pharmacist:
        raise HTTPException(status_code=404, detail="Pharmacist profile not found")
    
    item = db.query(InventoryItem).filter(
        InventoryItem.id == item_id,
        InventoryItem.pharmacist_id == pharmacist.id
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    db.delete(item)
    db.commit()
    return {"message": "Item deleted"}

@router.get("/low-stock", response_model=List[InventoryItemResponse])
def get_low_stock_items(
    current_user: User = Depends(require_role(["pharmacist"])),
    db: Session = Depends(get_db)
):
    pharmacist = db.query(Pharmacist).filter(Pharmacist.user_id == current_user.id).first()
    if not pharmacist:
        raise HTTPException(status_code=404, detail="Pharmacist profile not found")
    
    items = db.query(InventoryItem).filter(
        InventoryItem.pharmacist_id == pharmacist.id,
        InventoryItem.stock_quantity <= InventoryItem.min_stock_level
    ).all()
    
    return items

@router.get("/substitutions/{item_id}")
def get_substitution_suggestions(
    item_id: int,
    current_user: User = Depends(require_role(["pharmacist"])),
    db: Session = Depends(get_db)
):
    pharmacist = db.query(Pharmacist).filter(Pharmacist.user_id == current_user.id).first()
    if not pharmacist:
        raise HTTPException(status_code=404, detail="Pharmacist profile not found")
    
    item = db.query(InventoryItem).filter(
        InventoryItem.id == item_id,
        InventoryItem.pharmacist_id == pharmacist.id
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Find items with same generic name
    substitutions = db.query(InventoryItem).filter(
        InventoryItem.pharmacist_id == pharmacist.id,
        InventoryItem.generic_name == item.generic_name,
        InventoryItem.id != item_id,
        InventoryItem.stock_quantity > 0
    ).all()
    
    return {
        "original_item": {
            "id": item.id,
            "name": item.name,
            "generic_name": item.generic_name
        },
        "substitutions": [
            {
                "id": sub.id,
                "name": sub.name,
                "generic_name": sub.generic_name,
                "price": sub.price,
                "stock_quantity": sub.stock_quantity
            }
            for sub in substitutions
        ]
    }

