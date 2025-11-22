from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid
from datetime import datetime
from app.database import get_db
from app.models import User, Consultation, Appointment, Doctor, Patient
from app.schemas import ConsultationCreate, ConsultationResponse
from app.auth import require_role

router = APIRouter()

@router.post("/", response_model=ConsultationResponse)
def create_consultation(
    consultation_data: ConsultationCreate,
    current_user: User = Depends(require_role(["doctor", "patient"])),
    db: Session = Depends(get_db)
):
    appointment = db.query(Appointment).filter(Appointment.id == consultation_data.appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # Check authorization
    if current_user.role.value == "patient":
        patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
        if appointment.patient_id != patient.id:
            raise HTTPException(status_code=403, detail="Not authorized")
    elif current_user.role.value == "doctor":
        doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        if appointment.doctor_id != doctor.id:
            raise HTTPException(status_code=403, detail="Not authorized")
    
    # Check if consultation already exists
    existing = db.query(Consultation).filter(Consultation.appointment_id == consultation_data.appointment_id).first()
    if existing:
        return existing
    
    # Create consultation room
    room_id = str(uuid.uuid4())
    consultation = Consultation(
        appointment_id=consultation_data.appointment_id,
        consultation_type=consultation_data.consultation_type,
        room_id=room_id,
        start_time=datetime.utcnow()
    )
    db.add(consultation)
    db.commit()
    db.refresh(consultation)
    return consultation

@router.get("/room/{room_id}", response_model=ConsultationResponse)
def get_consultation_room(
    room_id: str,
    current_user: User = Depends(require_role(["doctor", "patient"])),
    db: Session = Depends(get_db)
):
    consultation = db.query(Consultation).filter(Consultation.room_id == room_id).first()
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation room not found")
    
    # Check authorization
    appointment = db.query(Appointment).filter(Appointment.id == consultation.appointment_id).first()
    if current_user.role.value == "patient":
        patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
        if appointment.patient_id != patient.id:
            raise HTTPException(status_code=403, detail="Not authorized")
    elif current_user.role.value == "doctor":
        doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        if appointment.doctor_id != doctor.id:
            raise HTTPException(status_code=403, detail="Not authorized")
    
    return consultation

@router.put("/{consultation_id}/end")
def end_consultation(
    consultation_id: int,
    recording_url: str = None,
    current_user: User = Depends(require_role(["doctor"])),
    db: Session = Depends(get_db)
):
    consultation = db.query(Consultation).filter(Consultation.id == consultation_id).first()
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")
    
    appointment = db.query(Appointment).filter(Appointment.id == consultation.appointment_id).first()
    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    if appointment.doctor_id != doctor.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    consultation.end_time = datetime.utcnow()
    if recording_url:
        consultation.recording_url = recording_url
    db.commit()
    return {"message": "Consultation ended"}

