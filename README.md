<<<<<<< HEAD
# MedPro Frontend

React + Tailwind CSS frontend for the medical management system.
=======
# MedPro Backend API

FastAPI backend for the medical management system.
>>>>>>> d84f64b82b8aa78dce0b63c0e77f7f07ef4dd51f

## Setup

1. Install dependencies:
```bash
<<<<<<< HEAD
npm install
```

2. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Features

- Role-based dashboards (Patient, Doctor, Pharmacist, Ambulance, Admin)
- JWT authentication
- Responsive design with Tailwind CSS
- Real-time updates
- Modern UI/UX
=======
pip install -r requirements.txt
```

2. Create a `.env` file from `.env.example` and configure:
- DATABASE_URL
- SECRET_KEY
- OPENAI_API_KEY (optional, for enhanced chatbot)

3. Run the server:
```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

API documentation: `http://localhost:8000/docs`
>>>>>>> d84f64b82b8aa78dce0b63c0e77f7f07ef4dd51f

