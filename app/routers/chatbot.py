from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.models import User
from app.auth import require_role
import os

router = APIRouter()

class ChatMessage(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

@router.post("/chat", response_model=ChatResponse)
def chat_with_bot(
    chat_data: ChatMessage,
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db)
):
    # Simple rule-based chatbot (can be enhanced with OpenAI API)
    message_lower = chat_data.message.lower()
    
    if any(word in message_lower for word in ["fever", "temperature"]):
        response = "Fever can be a symptom of various conditions. Please monitor your temperature and consult a doctor if it persists above 38°C or lasts more than 3 days."
    elif any(word in message_lower for word in ["headache", "head ache"]):
        response = "Headaches can have many causes. Stay hydrated, rest in a quiet room, and consider over-the-counter pain relief. If severe or persistent, consult a doctor."
    elif any(word in message_lower for word in ["appointment", "book", "schedule"]):
        response = "You can book an appointment through the appointments section. Select a doctor and choose an available time slot."
    elif any(word in message_lower for word in ["medicine", "prescription", "medication"]):
        response = "For medication queries, please consult with your doctor or pharmacist. You can order medicines through the medicine ordering section."
    elif any(word in message_lower for word in ["emergency", "urgent", "sos"]):
        response = "If this is a medical emergency, please use the SOS Emergency Alert feature immediately or call emergency services."
    elif any(word in message_lower for word in ["hello", "hi", "hey"]):
        response = "Hello! I'm your health assistant. How can I help you today? I can assist with general health queries, appointment booking, and medication information."
    else:
        response = "I understand you're asking about: " + chat_data.message + ". For specific medical advice, please consult with a healthcare professional. I can help you book appointments or find information about our services."
    
    return ChatResponse(response=response)

