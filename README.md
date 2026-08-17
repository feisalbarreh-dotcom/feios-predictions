# a_professional_betting

## Description
A commercial website built with React and FastAPI.

## Features
- None

## Tech Stack
- **Frontend**: React + Tailwind CSS
- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL
- **Authentication**: JWT

## Quick Start

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## API Endpoints
- GET `/api/` - Health check
- POST `/api/auth/login` - Login
- POST `/api/auth/register` - Register

## License
MIT

## Author
Built with FEIOS AI Operating System
