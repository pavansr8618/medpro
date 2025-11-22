from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum

class UserRole(str, enum.Enum):
    PATIENT = "patient"
    DOCTOR = "doctor"
    PHARMACIST = "pharmacist"
    AMBULANCE = "ambulance"
    ADMIN = "admin"

class AppointmentStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class EmergencyStatus(str, enum.Enum):
    PENDING = "pending"
    ASSIGNED = "assigned"
    IN_TRANSIT = "in_transit"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    patient_profile = relationship("Patient", back_populates="user", uselist=False)
    doctor_profile = relationship("Doctor", back_populates="user", uselist=False)
    pharmacist_profile = relationship("Pharmacist", back_populates="user", uselist=False)
    ambulance_profile = relationship("Ambulance", back_populates="user", uselist=False)
    admin_profile = relationship("Admin", back_populates="user", uselist=False)

class Patient(Base):
    __tablename__ = "patients"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    phone = Column(String)
    date_of_birth = Column(DateTime)
    gender = Column(String)
    address = Column(Text)
    blood_group = Column(String)
    emergency_contact = Column(String)
    emergency_phone = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="patient_profile")
    appointments = relationship("Appointment", back_populates="patient")
    health_records = relationship("HealthRecord", back_populates="patient")
    health_tracker_entries = relationship("HealthTracker", back_populates="patient")
    orders = relationship("MedicineOrder", back_populates="patient")

class Doctor(Base):
    __tablename__ = "doctors"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    phone = Column(String)
    specialization = Column(String, nullable=False)
    license_number = Column(String, unique=True)
    years_of_experience = Column(Integer)
    qualification = Column(String)
    hospital = Column(String)
    consultation_fee = Column(Float, default=0.0)
    bio = Column(Text)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="doctor_profile")
    appointments = relationship("Appointment", back_populates="doctor")
    prescriptions = relationship("Prescription", back_populates="doctor")
    earnings = relationship("DoctorEarning", back_populates="doctor")

class Pharmacist(Base):
    __tablename__ = "pharmacists"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    phone = Column(String)
    pharmacy_name = Column(String, nullable=False)
    license_number = Column(String, unique=True)
    address = Column(Text)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="pharmacist_profile")
    inventory_items = relationship("InventoryItem", back_populates="pharmacist")
    orders = relationship("MedicineOrder", back_populates="pharmacist")

class Ambulance(Base):
    __tablename__ = "ambulances"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    driver_name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    vehicle_number = Column(String, unique=True, nullable=False)
    license_number = Column(String)
    is_available = Column(Boolean, default=True)
    current_latitude = Column(Float)
    current_longitude = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="ambulance_profile")
    emergency_requests = relationship("EmergencyRequest", back_populates="ambulance")

class Admin(Base):
    __tablename__ = "admins"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    phone = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="admin_profile")

class Appointment(Base):
    __tablename__ = "appointments"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    appointment_date = Column(DateTime, nullable=False)
    status = Column(SQLEnum(AppointmentStatus), default=AppointmentStatus.PENDING)
    reason = Column(Text)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    patient = relationship("Patient", back_populates="appointments")
    doctor = relationship("Doctor", back_populates="appointments")
    consultation = relationship("Consultation", back_populates="appointment", uselist=False)

class HealthRecord(Base):
    __tablename__ = "health_records"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    record_type = Column(String, nullable=False)  # prescription, lab_report, xray, etc.
    title = Column(String, nullable=False)
    description = Column(Text)
    file_url = Column(String)
    date = Column(DateTime, nullable=False)
    doctor_name = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    patient = relationship("Patient", back_populates="health_records")

class HealthTracker(Base):
    __tablename__ = "health_tracker"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    metric_type = Column(String, nullable=False)  # weight, blood_pressure, glucose, etc.
    value = Column(Float, nullable=False)
    unit = Column(String)
    notes = Column(Text)
    recorded_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    patient = relationship("Patient", back_populates="health_tracker_entries")

class Prescription(Base):
    __tablename__ = "prescriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    diagnosis = Column(Text, nullable=False)
    medications = Column(JSON, nullable=False)  # [{"name": "...", "dosage": "...", "frequency": "..."}]
    instructions = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    patient = relationship("Patient")
    doctor = relationship("Doctor", back_populates="prescriptions")

class InventoryItem(Base):
    __tablename__ = "inventory_items"
    
    id = Column(Integer, primary_key=True, index=True)
    pharmacist_id = Column(Integer, ForeignKey("pharmacists.id"), nullable=False)
    name = Column(String, nullable=False)
    generic_name = Column(String)
    barcode = Column(String, unique=True)
    category = Column(String)
    stock_quantity = Column(Integer, default=0)
    min_stock_level = Column(Integer, default=10)
    price = Column(Float, nullable=False)
    expiry_date = Column(DateTime)
    manufacturer = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    pharmacist = relationship("Pharmacist", back_populates="inventory_items")
    order_items = relationship("OrderItem", back_populates="inventory_item")

class MedicineOrder(Base):
    __tablename__ = "medicine_orders"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    pharmacist_id = Column(Integer, ForeignKey("pharmacists.id"), nullable=False)
    prescription_id = Column(Integer, ForeignKey("prescriptions.id"), nullable=True)
    status = Column(SQLEnum(OrderStatus), default=OrderStatus.PENDING)
    total_amount = Column(Float, nullable=False)
    delivery_address = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    patient = relationship("Patient", back_populates="orders")
    pharmacist = relationship("Pharmacist", back_populates="orders")
    order_items = relationship("OrderItem", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("medicine_orders.id"), nullable=False)
    inventory_item_id = Column(Integer, ForeignKey("inventory_items.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    
    order = relationship("MedicineOrder", back_populates="order_items")
    inventory_item = relationship("InventoryItem", back_populates="order_items")

class Consultation(Base):
    __tablename__ = "consultations"
    
    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id"), unique=True, nullable=False)
    consultation_type = Column(String, nullable=False)  # video, audio
    room_id = Column(String, unique=True, nullable=False)
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    recording_url = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    appointment = relationship("Appointment", back_populates="consultation")

class EmergencyRequest(Base):
    __tablename__ = "emergency_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    ambulance_id = Column(Integer, ForeignKey("ambulances.id"), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(Text, nullable=False)
    status = Column(SQLEnum(EmergencyStatus), default=EmergencyStatus.PENDING)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    patient = relationship("Patient")
    ambulance = relationship("Ambulance", back_populates="emergency_requests")

class DoctorEarning(Base):
    __tablename__ = "doctor_earnings"
    
    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    amount = Column(Float, nullable=False)
    source = Column(String, nullable=False)  # consultation, appointment
    source_id = Column(Integer, nullable=False)
    date = Column(DateTime, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    doctor = relationship("Doctor", back_populates="earnings")

class Complaint(Base):
    __tablename__ = "complaints"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String, default="pending")  # pending, resolved, closed
    admin_response = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User")

