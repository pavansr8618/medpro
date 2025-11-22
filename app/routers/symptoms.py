from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from app.database import get_db
from app.models import User
from app.auth import require_role

router = APIRouter()

class SymptomCheckRequest(BaseModel):
    symptoms: List[str]
    age: int
    gender: str

class SymptomCheckResponse(BaseModel):
    possible_conditions: List[dict]
    severity: str
    recommendation: str

# Simple symptom checker (can be enhanced with medical API)
SYMPTOM_DATABASE = {
    "fever": ["Common Cold", "Flu", "COVID-19", "Infection"],
    "cough": ["Common Cold", "Flu", "Bronchitis", "COVID-19"],
    "headache": ["Migraine", "Tension Headache", "Sinusitis"],
    "chest pain": ["Heart Condition", "Anxiety", "Muscle Strain"],
    "shortness of breath": ["Asthma", "Anxiety", "Heart Condition"],
    "nausea": ["Food Poisoning", "Gastroenteritis", "Migraine"],
    "fatigue": ["Anemia", "Depression", "Chronic Fatigue"],
}

@router.post("/check", response_model=SymptomCheckResponse)
def check_symptoms(
    symptom_data: SymptomCheckRequest,
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db)
):
    possible_conditions = []
    condition_scores = {}
    
    # Analyze symptoms
    for symptom in symptom_data.symptoms:
        symptom_lower = symptom.lower()
        for key, conditions in SYMPTOM_DATABASE.items():
            if key in symptom_lower:
                for condition in conditions:
                    condition_scores[condition] = condition_scores.get(condition, 0) + 1
    
    # Get top conditions
    sorted_conditions = sorted(condition_scores.items(), key=lambda x: x[1], reverse=True)
    possible_conditions = [
        {"condition": condition, "likelihood": min(score * 20, 90)} 
        for condition, score in sorted_conditions[:5]
    ]
    
    # Determine severity
    high_risk_symptoms = ["chest pain", "shortness of breath", "severe pain"]
    has_high_risk = any(any(risk in s.lower() for risk in high_risk_symptoms) for s in symptom_data.symptoms)
    
    severity = "high" if has_high_risk else "moderate" if len(symptom_data.symptoms) > 2 else "low"
    
    if severity == "high":
        recommendation = "Please seek immediate medical attention or use the SOS Emergency feature."
    elif severity == "moderate":
        recommendation = "Consider booking an appointment with a doctor for evaluation."
    else:
        recommendation = "Monitor your symptoms. If they persist or worsen, consult a healthcare professional."
    
    return SymptomCheckResponse(
        possible_conditions=possible_conditions,
        severity=severity,
        recommendation=recommendation
    )

