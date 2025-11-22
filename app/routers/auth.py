from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import Dict, Any
from app.database import get_db
from app.models import User, Patient, Doctor, Pharmacist, Ambulance, Admin, UserRole
from app.schemas import UserRegister, UserLogin, Token, PatientCreate, DoctorCreate, PharmacistCreate, AmbulanceCreate
from app.auth import (
    get_password_hash, authenticate_user, create_access_token,
    get_current_active_user, ACCESS_TOKEN_EXPIRE_MINUTES
)

router = APIRouter()

@router.post("/register", response_model=Token)
def register(
    registration_data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    # Extract user data
    email = registration_data.get("email")
    password = registration_data.get("password")
    role = registration_data.get("role")
    
    if not email or not password or not role:
        raise HTTPException(status_code=400, detail="Missing required fields: email, password, role")
    
    # Check if user exists
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    hashed_password = get_password_hash(password)
    try:
        user_role = UserRole(role)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid role: {role}")
    
    db_user = User(
        email=email,
        password_hash=hashed_password,
        role=user_role,
        is_verified=False if role in ["doctor", "pharmacist"] else True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Extract profile data (remove user registration fields)
    profile_data = {k: v for k, v in registration_data.items() 
                    if k not in ["email", "password", "role"]}
    
    # Create profile based on role
    if role == "patient":
        profile = Patient(user_id=db_user.id, **profile_data)
    elif role == "doctor":
        profile = Doctor(user_id=db_user.id, **profile_data)
    elif role == "pharmacist":
        profile = Pharmacist(user_id=db_user.id, **profile_data)
    elif role == "ambulance":
        profile = Ambulance(user_id=db_user.id, **profile_data)
    elif role == "admin":
        profile = Admin(user_id=db_user.id, **profile_data)
    
    db.add(profile)
    db.commit()
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.email, "role": db_user.role.value if hasattr(db_user.role, 'value') else str(db_user.role)},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, user_credentials.email, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role.value},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me")
def get_current_user_info(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    user_data = {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role.value,
        "is_active": current_user.is_active,
        "is_verified": current_user.is_verified
    }
    
    # Get profile based on role
    if current_user.role.value == "patient":
        profile = db.query(Patient).filter(Patient.user_id == current_user.id).first()
        if profile:
            user_data["profile"] = {
                "first_name": profile.first_name,
                "last_name": profile.last_name,
                "phone": profile.phone
            }
    elif current_user.role.value == "doctor":
        profile = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        if profile:
            user_data["profile"] = {
                "first_name": profile.first_name,
                "last_name": profile.last_name,
                "specialization": profile.specialization
            }
    elif current_user.role.value == "pharmacist":
        profile = db.query(Pharmacist).filter(Pharmacist.user_id == current_user.id).first()
        if profile:
            user_data["profile"] = {
                "first_name": profile.first_name,
                "last_name": profile.last_name,
                "pharmacy_name": profile.pharmacy_name
            }
    elif current_user.role.value == "ambulance":
        profile = db.query(Ambulance).filter(Ambulance.user_id == current_user.id).first()
        if profile:
            user_data["profile"] = {
                "driver_name": profile.driver_name,
                "vehicle_number": profile.vehicle_number
            }
    
    return user_data

