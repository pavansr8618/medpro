from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Ambulance
from app.schemas import AmbulanceResponse, AmbulanceCreate
from app.auth import get_current_active_user, require_role

router = APIRouter()

@router.get("/profile", response_model=AmbulanceResponse)
def get_ambulance_profile(
    current_user: User = Depends(require_role(["ambulance"])),
    db: Session = Depends(get_db)
):
    ambulance = db.query(Ambulance).filter(Ambulance.user_id == current_user.id).first()
    if not ambulance:
        raise HTTPException(status_code=404, detail="Ambulance profile not found")
    return ambulance

@router.put("/profile", response_model=AmbulanceResponse)
def update_ambulance_profile(
    profile_data: AmbulanceCreate,
    current_user: User = Depends(require_role(["ambulance"])),
    db: Session = Depends(get_db)
):
    ambulance = db.query(Ambulance).filter(Ambulance.user_id == current_user.id).first()
    if not ambulance:
        raise HTTPException(status_code=404, detail="Ambulance profile not found")
    
    for key, value in profile_data.dict(exclude_unset=True).items():
        setattr(ambulance, key, value)
    
    db.commit()
    db.refresh(ambulance)
    return ambulance

@router.put("/location")
def update_location(
    latitude: float,
    longitude: float,
    current_user: User = Depends(require_role(["ambulance"])),
    db: Session = Depends(get_db)
):
    ambulance = db.query(Ambulance).filter(Ambulance.user_id == current_user.id).first()
    if not ambulance:
        raise HTTPException(status_code=404, detail="Ambulance profile not found")
    
    ambulance.current_latitude = latitude
    ambulance.current_longitude = longitude
    db.commit()
    return {"message": "Location updated"}

@router.put("/availability")
def update_availability(
    is_available: bool,
    current_user: User = Depends(require_role(["ambulance"])),
    db: Session = Depends(get_db)
):
    ambulance = db.query(Ambulance).filter(Ambulance.user_id == current_user.id).first()
    if not ambulance:
        raise HTTPException(status_code=404, detail="Ambulance profile not found")
    
    ambulance.is_available = is_available
    db.commit()
    return {"message": "Availability updated", "is_available": is_available}

