from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy import func
from app.database import get_db
from app.models import (
    User, Patient, Doctor, Pharmacist, Ambulance, Admin,
    Appointment, MedicineOrder, EmergencyRequest, Complaint
)
from app.schemas import ComplaintResponse
from app.auth import require_role

router = APIRouter()

@router.get("/users")
def get_all_users(
    role: str = None,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    users = query.all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "role": u.role.value,
            "is_active": u.is_active,
            "is_verified": u.is_verified
        }
        for u in users
    ]

@router.put("/users/{user_id}/verify")
def verify_user(
    user_id: int,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_verified = True
    
    # Also verify profile
    if user.role.value == "doctor":
        doctor = db.query(Doctor).filter(Doctor.user_id == user_id).first()
        if doctor:
            doctor.is_verified = True
    elif user.role.value == "pharmacist":
        pharmacist = db.query(Pharmacist).filter(Pharmacist.user_id == user_id).first()
        if pharmacist:
            pharmacist.is_verified = True
    
    db.commit()
    return {"message": "User verified"}

@router.put("/users/{user_id}/deactivate")
def deactivate_user(
    user_id: int,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = False
    db.commit()
    return {"message": "User deactivated"}

@router.get("/analytics")
def get_analytics(
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    total_users = db.query(func.count(User.id)).scalar()
    total_patients = db.query(func.count(Patient.id)).scalar()
    total_doctors = db.query(func.count(Doctor.id)).scalar()
    total_pharmacists = db.query(func.count(Pharmacist.id)).scalar()
    total_ambulances = db.query(func.count(Ambulance.id)).scalar()
    total_appointments = db.query(func.count(Appointment.id)).scalar()
    total_orders = db.query(func.count(MedicineOrder.id)).scalar()
    total_emergencies = db.query(func.count(EmergencyRequest.id)).scalar()
    
    return {
        "total_users": total_users,
        "total_patients": total_patients,
        "total_doctors": total_doctors,
        "total_pharmacists": total_pharmacists,
        "total_ambulances": total_ambulances,
        "total_appointments": total_appointments,
        "total_orders": total_orders,
        "total_emergencies": total_emergencies
    }

@router.get("/complaints", response_model=List[ComplaintResponse])
def get_all_complaints(
    status: str = None,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    query = db.query(Complaint)
    if status:
        query = query.filter(Complaint.status == status)
    return query.order_by(Complaint.created_at.desc()).all()

@router.put("/complaints/{complaint_id}/resolve")
def resolve_complaint(
    complaint_id: int,
    admin_response: str,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    complaint.status = "resolved"
    complaint.admin_response = admin_response
    db.commit()
    return {"message": "Complaint resolved"}

