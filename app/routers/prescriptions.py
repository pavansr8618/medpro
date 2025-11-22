from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User, Doctor, Patient, Prescription
from app.schemas import PrescriptionCreate, PrescriptionResponse
from app.auth import require_role

router = APIRouter()

@router.post("/", response_model=PrescriptionResponse)
def create_prescription(
    prescription_data: PrescriptionCreate,
    current_user: User = Depends(require_role(["doctor"])),
    db: Session = Depends(get_db)
):
    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")
    
    patient = db.query(Patient).filter(Patient.id == prescription_data.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    medications_json = [med.dict() for med in prescription_data.medications]
    
    prescription = Prescription(
        patient_id=prescription_data.patient_id,
        doctor_id=doctor.id,
        diagnosis=prescription_data.diagnosis,
        medications=medications_json,
        instructions=prescription_data.instructions
    )
    db.add(prescription)
    db.commit()
    db.refresh(prescription)
    return prescription

@router.get("/patient/{patient_id}", response_model=List[PrescriptionResponse])
def get_patient_prescriptions(
    patient_id: int,
    current_user: User = Depends(require_role(["doctor", "patient"])),
    db: Session = Depends(get_db)
):
    # Check authorization
    if current_user.role.value == "patient":
        patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
        if patient.id != patient_id:
            raise HTTPException(status_code=403, detail="Not authorized")
    
    prescriptions = db.query(Prescription).filter(
        Prescription.patient_id == patient_id
    ).order_by(Prescription.created_at.desc()).all()
    return prescriptions

@router.get("/doctor", response_model=List[PrescriptionResponse])
def get_doctor_prescriptions(
    current_user: User = Depends(require_role(["doctor"])),
    db: Session = Depends(get_db)
):
    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")
    
    prescriptions = db.query(Prescription).filter(
        Prescription.doctor_id == doctor.id
    ).order_by(Prescription.created_at.desc()).all()
    return prescriptions

