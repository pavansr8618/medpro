# MedPro - Medical Management System

A complete full-stack medical management system with role-based access for Patients, Doctors, Pharmacists, Ambulances, and Admins.

## Features

### Patient Features
- Appointments booking and management
- Health tracker (weight, blood pressure, glucose, etc.)
- Health records locker (prescriptions, lab reports, scans)
- AI-powered chatbot for health queries
- Symptoms checker with preliminary diagnosis
- Medicine ordering from pharmacies
- Video/audio consultations
- SOS emergency alerts with GPS tracking
- Health insights and analytics

### Doctor Features
- Calendar and appointment scheduling
- Appointment management (confirm, cancel, complete)
- Video/audio consultations
- Prescription generator
- Patient history viewer
- Earnings analytics
- AI decision support
- Personal notes

### Pharmacist Features
- Inventory management
- Barcode scanning
- Low stock alerts
- Medicine substitution suggestions
- Order processing workflow
- Prescription verification

### Ambulance Features
- Real-time GPS tracking
- Emergency request handling
- Route optimization
- Status updates (assigned, in transit, completed)
- Driver profile management
- Hospital auto-notify

### Admin Features
- User management (all roles)
- Doctor/pharmacist verification
- Analytics dashboards
- Complaint handling
- System monitoring

## Tech Stack

### Backend
- FastAPI (Python)
- SQLAlchemy (ORM)
- PostgreSQL/SQLite
- JWT Authentication
- Pydantic (Validation)

### Frontend
- React 18
- Tailwind CSS
- React Router
- Axios
- Recharts (Analytics)
- React Icons

## Setup Instructions

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

5. Update `.env` with your configuration:
```
DATABASE_URL=sqlite:///./medpro.db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

6. Run the server:
```bash
uvicorn app.main:app --reload
```

Backend will be available at `http://localhost:8000`
API docs at `http://localhost:8000/docs`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

Frontend will be available at `http://localhost:3000`

## Project Structure

```
medpro/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── auth.py
│   │   └── routers/
│   │       ├── auth.py
│   │       ├── patients.py
│   │       ├── doctors.py
│   │       ├── pharmacists.py
│   │       ├── ambulances.py
│   │       ├── admin.py
│   │       ├── appointments.py
│   │       ├── health_tracker.py
│   │       ├── health_records.py
│   │       ├── chatbot.py
│   │       ├── symptoms.py
│   │       ├── medicines.py
│   │       ├── consultations.py
│   │       ├── emergency.py
│   │       ├── analytics.py
│   │       ├── prescriptions.py
│   │       └── inventory.py
│   ├── requirements.txt
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   ├── patient/
│   │   │   ├── doctor/
│   │   │   ├── pharmacist/
│   │   │   ├── ambulance/
│   │   │   └── admin/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── README.md
└── README.md
```

## Authentication

The system uses JWT-based authentication. After registration/login, a token is stored in localStorage and sent with each API request.

## Role-Based Access

Each role has access to specific features:
- **Patient**: Can book appointments, track health, order medicines, etc.
- **Doctor**: Can manage appointments, create prescriptions, view patient history
- **Pharmacist**: Can manage inventory, process orders, verify prescriptions
- **Ambulance**: Can respond to emergencies, update location
- **Admin**: Can manage users, verify professionals, view analytics

## API Endpoints

All API endpoints are prefixed with `/api/`. See `http://localhost:8000/docs` for complete API documentation.

## Development Notes

- The database is SQLite by default (for easy setup). For production, use PostgreSQL.
- Some features like video consultation require additional WebRTC setup.
- GPS tracking requires location permissions in the browser.
- The chatbot is rule-based. For production, integrate with OpenAI or similar service.

## License

This project is for educational purposes.

