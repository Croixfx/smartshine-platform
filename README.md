# SmartShine Car Wash Platform

A full-stack car wash management platform built for Rwanda.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Django 4.2 + Django REST Framework |
| Frontend | React 18 + Vite + Tailwind CSS |
| Database | PostgreSQL 16 |
| Real-time | Django Channels + Redis |
| Auth | JWT (SimpleJWT) + OTP via Africa's Talking |
| Payments | MTN MoMo API |

## Project Structure

```
smartshine-platform/
├── backend/
│   ├── accounts/        # Custom user model, OTP auth
│   ├── branches/        # Branch locations & service types
│   ├── bookings/        # Booking lifecycle
│   ├── vehicles/        # Customer vehicles
│   ├── payments/        # MoMo integration
│   ├── notifications/   # SMS via Africa's Talking
│   ├── smartshine/      # Django project settings
│   └── manage.py
├── frontend/
│   ├── src/
│   │   ├── api/         # Axios client with JWT interceptor
│   │   ├── contexts/    # AuthContext
│   │   ├── components/  # Navbar, Footer, ProtectedRoute, RoleRoute
│   │   └── pages/       # auth/, customer/, worker/, driver/, admin/
│   └── package.json
├── .gitignore
├── README.md
└── CONTRIBUTING.md
```

## Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 16+
- Redis 7+

## Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your database credentials and API keys

# Create the database (PostgreSQL must be running)
createdb smartshine_db

# Run migrations
python manage.py migrate

# Create a superuser
python manage.py createsuperuser

# Start the server
python manage.py runserver
```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## API Endpoints

| Method | URL | Description | Auth |
|--------|-----|-------------|------|
| POST | `/api/accounts/register/` | Register new user | Public |
| POST | `/api/accounts/otp/request/` | Request OTP | Public |
| POST | `/api/accounts/otp/verify/` | Verify OTP → JWT tokens | Public |
| POST | `/api/token/refresh/` | Refresh access token | Public |
| GET/PUT | `/api/accounts/profile/` | Own profile | Required |
| GET | `/api/branches/` | List branches | Public |
| GET | `/api/branches/{id}/` | Branch detail + services | Public |
| GET | `/api/services/` | List services | Public |
| CRUD | `/api/vehicles/` | Customer vehicles | Customer |
| CRUD | `/api/bookings/` | Bookings | Customer/Worker |
| PATCH | `/api/bookings/{id}/cancel/` | Cancel booking | Customer |
| PATCH | `/api/bookings/{id}/status/` | Advance status | Worker |
| GET | `/api/payments/` | Payment history | Customer |
| POST | `/api/payments/initiate/` | Pay for booking | Customer |

- **Browsable API:** http://localhost:8000/api/
- **Admin panel:** http://localhost:8000/admin/

## Team

| Name | Student ID | Role |
|------|-----------|------|
| NIYONKURU Jean De La Croix | 223003235 | Backend APIs + AI module |
| UMUHIRE Ange Sandrine | 223007061 | Frontend React + UI |
| ZINARYIZA Billy Charmant | 222013795 | Backend integrations (MoMo, SMS, WebSocket) |
