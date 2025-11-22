from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User, Patient, HealthTracker
from app.schemas import HealthTrackerCreate, HealthTrackerResponse
from app.auth import require_role

router = APIRouter()

@router.post("/", response_model=HealthTrackerResponse)
def add_health_tracker_entry(
    entry_data: HealthTrackerCreate,
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    
    entry = HealthTracker(
        patient_id=patient.id,
        **entry_data.dict()
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

@router.get("/", response_model=List[HealthTrackerResponse])
def get_health_tracker_entries(
    metric_type: str = None,
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    
    query = db.query(HealthTracker).filter(HealthTracker.patient_id == patient.id)
    if metric_type:
        query = query.filter(HealthTracker.metric_type == metric_type)
    
    return query.order_by(HealthTracker.recorded_at.desc()).all()

@router.delete("/{entry_id}")
def delete_health_tracker_entry(
    entry_id: int,
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    
    entry = db.query(HealthTracker).filter(
        HealthTracker.id == entry_id,
        HealthTracker.patient_id == patient.id
    ).first()
    
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    db.delete(entry)
    db.commit()
    return {"message": "Entry deleted"}

