from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User, Patient, HealthRecord
from app.schemas import HealthRecordCreate, HealthRecordResponse
from app.auth import require_role
import uuid
import os

router = APIRouter()

UPLOAD_DIR = "uploads/health_records"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/", response_model=HealthRecordResponse)
def add_health_record(
    record_data: HealthRecordCreate,
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    
    record = HealthRecord(
        patient_id=patient.id,
        **record_data.dict()
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

@router.post("/upload")
def upload_health_record_file(
    file: UploadFile = File(...),
    record_id: int = None,
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    
    # Generate unique filename
    file_ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        content = file.file.read()
        buffer.write(content)
    
    file_url = f"/uploads/health_records/{filename}"
    
    if record_id:
        record = db.query(HealthRecord).filter(
            HealthRecord.id == record_id,
            HealthRecord.patient_id == patient.id
        ).first()
        if record:
            record.file_url = file_url
            db.commit()
            return {"message": "File uploaded", "file_url": file_url}
    
    return {"message": "File uploaded", "file_url": file_url}

@router.get("/", response_model=List[HealthRecordResponse])
def get_health_records(
    record_type: str = None,
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    
    query = db.query(HealthRecord).filter(HealthRecord.patient_id == patient.id)
    if record_type:
        query = query.filter(HealthRecord.record_type == record_type)
    
    return query.order_by(HealthRecord.date.desc()).all()

@router.delete("/{record_id}")
def delete_health_record(
    record_id: int,
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    
    record = db.query(HealthRecord).filter(
        HealthRecord.id == record_id,
        HealthRecord.patient_id == patient.id
    ).first()
    
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    
    db.delete(record)
    db.commit()
    return {"message": "Record deleted"}

