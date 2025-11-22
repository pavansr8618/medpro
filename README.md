# MedPro Backend API

FastAPI backend for the medical management system.

## Setup

1. Install dependencies:
```bash
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

