from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Pharmacist
from app.schemas import PharmacistResponse, PharmacistCreate
from app.auth import get_current_active_user, require_role

router = APIRouter()

@router.get("/profile", response_model=PharmacistResponse)
def get_pharmacist_profile(
    current_user: User = Depends(require_role(["pharmacist"])),
    db: Session = Depends(get_db)
):
    pharmacist = db.query(Pharmacist).filter(Pharmacist.user_id == current_user.id).first()
    if not pharmacist:
        raise HTTPException(status_code=404, detail="Pharmacist profile not found")
    return pharmacist

@router.put("/profile", response_model=PharmacistResponse)
def update_pharmacist_profile(
    profile_data: PharmacistCreate,
    current_user: User = Depends(require_role(["pharmacist"])),
    db: Session = Depends(get_db)
):
    pharmacist = db.query(Pharmacist).filter(Pharmacist.user_id == current_user.id).first()
    if not pharmacist:
        raise HTTPException(status_code=404, detail="Pharmacist profile not found")
    
    for key, value in profile_data.dict(exclude_unset=True).items():
        setattr(pharmacist, key, value)
    
    db.commit()
    db.refresh(pharmacist)
    return pharmacist

