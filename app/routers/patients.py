from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User, Patient
from app.schemas import PatientResponse, PatientCreate
from app.auth import get_current_active_user, require_role

router = APIRouter()

@router.get("/profile", response_model=PatientResponse)
def get_patient_profile(
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    return patient

@router.put("/profile", response_model=PatientResponse)
def update_patient_profile(
    profile_data: PatientCreate,
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    
    for key, value in profile_data.dict(exclude_unset=True).items():
        setattr(patient, key, value)
    
    db.commit()
    db.refresh(patient)
    return patient

