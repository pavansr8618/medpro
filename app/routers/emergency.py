from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User, Patient, EmergencyRequest, Ambulance, EmergencyStatus
from app.schemas import EmergencyRequestCreate, EmergencyRequestResponse
from app.auth import require_role
import math

router = APIRouter()

def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two coordinates in km"""
    R = 6371  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    return R * c

@router.post("/sos", response_model=EmergencyRequestResponse)
def create_emergency_request(
    emergency_data: EmergencyRequestCreate,
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    
    # Find nearest available ambulance
    available_ambulances = db.query(Ambulance).filter(
        Ambulance.is_available == True,
        Ambulance.current_latitude.isnot(None),
        Ambulance.current_longitude.isnot(None)
    ).all()
    
    nearest_ambulance = None
    min_distance = float('inf')
    
    for ambulance in available_ambulances:
        distance = calculate_distance(
            emergency_data.latitude,
            emergency_data.longitude,
            ambulance.current_latitude,
            ambulance.current_longitude
        )
        if distance < min_distance:
            min_distance = distance
            nearest_ambulance = ambulance
    
    # Create emergency request
    emergency = EmergencyRequest(
        patient_id=patient.id,
        ambulance_id=nearest_ambulance.id if nearest_ambulance else None,
        latitude=emergency_data.latitude,
        longitude=emergency_data.longitude,
        address=emergency_data.address,
        description=emergency_data.description,
        status=EmergencyStatus.ASSIGNED if nearest_ambulance else EmergencyStatus.PENDING
    )
    
    if nearest_ambulance:
        nearest_ambulance.is_available = False
    
    db.add(emergency)
    db.commit()
    db.refresh(emergency)
    return emergency

@router.get("/patient", response_model=List[EmergencyRequestResponse])
def get_patient_emergencies(
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    
    emergencies = db.query(EmergencyRequest).filter(
        EmergencyRequest.patient_id == patient.id
    ).order_by(EmergencyRequest.created_at.desc()).all()
    return emergencies

@router.get("/ambulance", response_model=List[EmergencyRequestResponse])
def get_ambulance_emergencies(
    current_user: User = Depends(require_role(["ambulance"])),
    db: Session = Depends(get_db)
):
    ambulance = db.query(Ambulance).filter(Ambulance.user_id == current_user.id).first()
    if not ambulance:
        raise HTTPException(status_code=404, detail="Ambulance profile not found")
    
    emergencies = db.query(EmergencyRequest).filter(
        EmergencyRequest.ambulance_id == ambulance.id
    ).order_by(EmergencyRequest.created_at.desc()).all()
    return emergencies

@router.put("/{emergency_id}/status")
def update_emergency_status(
    emergency_id: int,
    status: EmergencyStatus,
    current_user: User = Depends(require_role(["ambulance"])),
    db: Session = Depends(get_db)
):
    emergency = db.query(EmergencyRequest).filter(EmergencyRequest.id == emergency_id).first()
    if not emergency:
        raise HTTPException(status_code=404, detail="Emergency request not found")
    
    ambulance = db.query(Ambulance).filter(Ambulance.user_id == current_user.id).first()
    if emergency.ambulance_id != ambulance.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    emergency.status = status
    
    if status == EmergencyStatus.COMPLETED or status == EmergencyStatus.CANCELLED:
        ambulance.is_available = True
    
    db.commit()
    return {"message": "Emergency status updated"}

