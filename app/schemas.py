from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from app.models import UserRole, AppointmentStatus, EmergencyStatus, OrderStatus

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    role: UserRole

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Patient Schemas
class PatientCreate(BaseModel):
    first_name: str
    last_name: str
    phone: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    blood_group: Optional[str] = None
    emergency_contact: Optional[str] = None
    emergency_phone: Optional[str] = None

class PatientResponse(BaseModel):
    id: int
    user_id: int
    first_name: str
    last_name: str
    phone: Optional[str]
    date_of_birth: Optional[datetime]
    gender: Optional[str]
    address: Optional[str]
    blood_group: Optional[str]
    emergency_contact: Optional[str]
    emergency_phone: Optional[str]
    
    class Config:
        from_attributes = True

# Doctor Schemas
class DoctorCreate(BaseModel):
    first_name: str
    last_name: str
    phone: Optional[str] = None
    specialization: str
    license_number: str
    years_of_experience: Optional[int] = None
    qualification: Optional[str] = None
    hospital: Optional[str] = None
    consultation_fee: Optional[float] = 0.0
    bio: Optional[str] = None

class DoctorResponse(BaseModel):
    id: int
    user_id: int
    first_name: str
    last_name: str
    phone: Optional[str]
    specialization: str
    license_number: str
    years_of_experience: Optional[int]
    qualification: Optional[str]
    hospital: Optional[str]
    consultation_fee: float
    bio: Optional[str]
    is_verified: bool
    
    class Config:
        from_attributes = True

# Pharmacist Schemas
class PharmacistCreate(BaseModel):
    first_name: str
    last_name: str
    phone: Optional[str] = None
    pharmacy_name: str
    license_number: str
    address: Optional[str] = None

class PharmacistResponse(BaseModel):
    id: int
    user_id: int
    first_name: str
    last_name: str
    phone: Optional[str]
    pharmacy_name: str
    license_number: str
    address: Optional[str]
    is_verified: bool
    
    class Config:
        from_attributes = True

# Ambulance Schemas
class AmbulanceCreate(BaseModel):
    driver_name: str
    phone: str
    vehicle_number: str
    license_number: Optional[str] = None

class AmbulanceResponse(BaseModel):
    id: int
    user_id: int
    driver_name: str
    phone: str
    vehicle_number: str
    license_number: Optional[str]
    is_available: bool
    current_latitude: Optional[float]
    current_longitude: Optional[float]
    
    class Config:
        from_attributes = True

# Appointment Schemas
class AppointmentCreate(BaseModel):
    doctor_id: int
    appointment_date: datetime
    reason: Optional[str] = None

class AppointmentResponse(BaseModel):
    id: int
    patient_id: int
    doctor_id: int
    appointment_date: datetime
    status: AppointmentStatus
    reason: Optional[str]
    notes: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

# Health Record Schemas
class HealthRecordCreate(BaseModel):
    record_type: str
    title: str
    description: Optional[str] = None
    file_url: Optional[str] = None
    date: datetime
    doctor_name: Optional[str] = None

class HealthRecordResponse(BaseModel):
    id: int
    patient_id: int
    record_type: str
    title: str
    description: Optional[str]
    file_url: Optional[str]
    date: datetime
    doctor_name: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

# Health Tracker Schemas
class HealthTrackerCreate(BaseModel):
    metric_type: str
    value: float
    unit: Optional[str] = None
    notes: Optional[str] = None
    recorded_at: datetime

class HealthTrackerResponse(BaseModel):
    id: int
    patient_id: int
    metric_type: str
    value: float
    unit: Optional[str]
    notes: Optional[str]
    recorded_at: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True

# Prescription Schemas
class MedicationItem(BaseModel):
    name: str
    dosage: str
    frequency: str

class PrescriptionCreate(BaseModel):
    patient_id: int
    diagnosis: str
    medications: List[MedicationItem]
    instructions: Optional[str] = None

class PrescriptionResponse(BaseModel):
    id: int
    patient_id: int
    doctor_id: int
    diagnosis: str
    medications: List[dict]
    instructions: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

# Inventory Schemas
class InventoryItemCreate(BaseModel):
    name: str
    generic_name: Optional[str] = None
    barcode: Optional[str] = None
    category: Optional[str] = None
    stock_quantity: int = 0
    min_stock_level: int = 10
    price: float
    expiry_date: Optional[datetime] = None
    manufacturer: Optional[str] = None

class InventoryItemResponse(BaseModel):
    id: int
    pharmacist_id: int
    name: str
    generic_name: Optional[str]
    barcode: Optional[str]
    category: Optional[str]
    stock_quantity: int
    min_stock_level: int
    price: float
    expiry_date: Optional[datetime]
    manufacturer: Optional[str]
    
    class Config:
        from_attributes = True

# Medicine Order Schemas
class OrderItemCreate(BaseModel):
    inventory_item_id: int
    quantity: int

class MedicineOrderCreate(BaseModel):
    pharmacist_id: int
    prescription_id: Optional[int] = None
    delivery_address: str
    order_items: List[OrderItemCreate]

class MedicineOrderResponse(BaseModel):
    id: int
    patient_id: int
    pharmacist_id: int
    prescription_id: Optional[int]
    status: OrderStatus
    total_amount: float
    delivery_address: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Consultation Schemas
class ConsultationCreate(BaseModel):
    appointment_id: int
    consultation_type: str

class ConsultationResponse(BaseModel):
    id: int
    appointment_id: int
    consultation_type: str
    room_id: str
    start_time: Optional[datetime]
    end_time: Optional[datetime]
    recording_url: Optional[str]
    
    class Config:
        from_attributes = True

# Emergency Schemas
class EmergencyRequestCreate(BaseModel):
    latitude: float
    longitude: float
    address: str
    description: Optional[str] = None

class EmergencyRequestResponse(BaseModel):
    id: int
    patient_id: int
    ambulance_id: Optional[int]
    latitude: float
    longitude: float
    address: str
    status: EmergencyStatus
    description: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

# Complaint Schemas
class ComplaintCreate(BaseModel):
    subject: str
    description: str

class ComplaintResponse(BaseModel):
    id: int
    user_id: int
    subject: str
    description: str
    status: str
    admin_response: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

