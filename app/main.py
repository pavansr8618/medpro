from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import (
    auth, patients, doctors, pharmacists, ambulances, admin,
    appointments, health_tracker, health_records, chatbot,
    symptoms, medicines, consultations, emergency, analytics,
    prescriptions, inventory
)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="MedPro API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(patients.router, prefix="/api/patients", tags=["Patients"])
app.include_router(doctors.router, prefix="/api/doctors", tags=["Doctors"])
app.include_router(pharmacists.router, prefix="/api/pharmacists", tags=["Pharmacists"])
app.include_router(ambulances.router, prefix="/api/ambulances", tags=["Ambulances"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(appointments.router, prefix="/api/appointments", tags=["Appointments"])
app.include_router(health_tracker.router, prefix="/api/health-tracker", tags=["Health Tracker"])
app.include_router(health_records.router, prefix="/api/health-records", tags=["Health Records"])
app.include_router(chatbot.router, prefix="/api/chatbot", tags=["Chatbot"])
app.include_router(symptoms.router, prefix="/api/symptoms", tags=["Symptoms"])
app.include_router(medicines.router, prefix="/api/medicines", tags=["Medicines"])
app.include_router(consultations.router, prefix="/api/consultations", tags=["Consultations"])
app.include_router(emergency.router, prefix="/api/emergency", tags=["Emergency"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(prescriptions.router, prefix="/api/prescriptions", tags=["Prescriptions"])
app.include_router(inventory.router, prefix="/api/inventory", tags=["Inventory"])

@app.get("/")
def root():
    return {"message": "MedPro API is running"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}

