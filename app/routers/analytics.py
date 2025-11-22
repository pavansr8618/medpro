from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.database import get_db
from app.models import User, Doctor, DoctorEarning, Appointment, Patient
from app.auth import require_role

router = APIRouter()

@router.get("/doctor/earnings")
def get_doctor_earnings(
    start_date: datetime = None,
    end_date: datetime = None,
    current_user: User = Depends(require_role(["doctor"])),
    db: Session = Depends(get_db)
):
    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")
    
    query = db.query(DoctorEarning).filter(DoctorEarning.doctor_id == doctor.id)
    
    if start_date:
        query = query.filter(DoctorEarning.date >= start_date)
    if end_date:
        query = query.filter(DoctorEarning.date <= end_date)
    
    earnings = query.all()
    total_earnings = sum(e.amount for e in earnings)
    
    return {
        "total_earnings": total_earnings,
        "earnings": [
            {
                "id": e.id,
                "amount": e.amount,
                "source": e.source,
                "date": e.date
            }
            for e in earnings
        ]
    }

@router.get("/doctor/appointments-stats")
def get_appointment_stats(
    current_user: User = Depends(require_role(["doctor"])),
    db: Session = Depends(get_db)
):
    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")
    
    total_appointments = db.query(func.count(Appointment.id)).filter(
        Appointment.doctor_id == doctor.id
    ).scalar()
    
    pending_appointments = db.query(func.count(Appointment.id)).filter(
        Appointment.doctor_id == doctor.id,
        Appointment.status == "pending"
    ).scalar()
    
    completed_appointments = db.query(func.count(Appointment.id)).filter(
        Appointment.doctor_id == doctor.id,
        Appointment.status == "completed"
    ).scalar()
    
    return {
        "total_appointments": total_appointments,
        "pending_appointments": pending_appointments,
        "completed_appointments": completed_appointments
    }

@router.get("/patient/health-insights")
def get_health_insights(
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    
    # Get recent appointments
    recent_appointments = db.query(Appointment).filter(
        Appointment.patient_id == patient.id
    ).order_by(Appointment.appointment_date.desc()).limit(5).all()
    
    # Get health tracker summary
    from app.models import HealthTracker
    recent_tracker = db.query(HealthTracker).filter(
        HealthTracker.patient_id == patient.id
    ).order_by(HealthTracker.recorded_at.desc()).limit(10).all()
    
    insights = {
        "recent_appointments_count": len(recent_appointments),
        "health_tracker_entries_count": len(recent_tracker),
        "recommendations": [
            "Schedule regular health checkups",
            "Maintain a healthy diet and exercise routine",
            "Keep track of your vital signs"
        ]
    }
    
    return insights

