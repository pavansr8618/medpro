from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User, Doctor
from app.schemas import DoctorResponse, DoctorCreate
from app.auth import get_current_active_user, require_role

router = APIRouter()

@router.get("/profile", response_model=DoctorResponse)
def get_doctor_profile(
    current_user: User = Depends(require_role(["doctor"])),
    db: Session = Depends(get_db)
):
    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")
    return doctor

@router.put("/profile", response_model=DoctorResponse)
def update_doctor_profile(
    profile_data: DoctorCreate,
    current_user: User = Depends(require_role(["doctor"])),
    db: Session = Depends(get_db)
):
    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")
    
    for key, value in profile_data.dict(exclude_unset=True).items():
        setattr(doctor, key, value)
    
    db.commit()
    db.refresh(doctor)
    return doctor

@router.get("/list", response_model=List[DoctorResponse])
def list_doctors(
    specialization: str = None,
    db: Session = Depends(get_db)
):
    query = db.query(Doctor).filter(Doctor.is_verified == True)
    if specialization:
        query = query.filter(Doctor.specialization.ilike(f"%{specialization}%"))
    return query.all()

