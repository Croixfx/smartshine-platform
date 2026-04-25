# SmartShine Car Wash Platform

A full-stack car wash management system built with **Django REST Framework** (backend) and **React + Vite + Tailwind CSS** (frontend).

---

## Project Structure

```
smartshine-platform/
├── backend/
│   ├── smartshine/        # Django project (settings, urls, wsgi, asgi, celery)
│   ├── accounts/          # Custom user model — phone as username, roles: customer/worker/driver/admin
│   ├── branches/          # Branch locations & ServiceType catalogue
│   ├── bookings/          # Booking lifecycle management
│   ├── vehicles/          # Customer vehicles + plate images
│   ├── payments/          # MTN MoMo payment integration
│   ├── notifications/     # Africa's Talking SMS dispatch (Celery tasks)
│   ├── requirements.txt
│   ├── .env               # Secret config — do NOT commit
│   └── manage.py
└── frontend/
    ├── src/
    │   ├── api/           # Axios instance with JWT interceptor + silent refresh
    │   ├── contexts/      # AuthContext (login / logout / user state)
    │   ├── hooks/         # useApi — generic data-fetching hook
    │   ├── components/    # Navbar, ProtectedRoute
    │   └── pages/         # Login, Register, Dashboard, Bookings, Vehicles, Branches, Payments
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## Prerequisites

| Tool | Version |
|------|---------|
| Python | 3.11+ |
| Node.js | 18+ |
| PostgreSQL | 14+ |
| Redis | 7+ |

---

## Backend Setup

```bash
cd backend

# 1. Create and activate virtual environment
python -m venv venv
source venv/Scripts/activate   # Windows
# source venv/bin/activate      # macOS / Linux

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env .env.local   # then edit .env with real values

# 4. Create PostgreSQL database
createdb smartshine_db

# 5. Run migrations
python manage.py migrate

# 6. Create superuser
python manage.py createsuperuser

# 7. Start development server
python manage.py runserver
```

### Run Celery worker (SMS / async tasks)

```bash
celery -A smartshine worker -l info
```

### Run Daphne (WebSocket / ASGI)

```bash
daphne smartshine.asgi:application
```

---

## Frontend Setup

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Start dev server (proxies /api → localhost:8000)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Environment Variables (backend/.env)

| Variable | Description |
|----------|-------------|
| `SECRET_KEY` | Django secret key |
| `DEBUG` | `True` for development |
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `AFRICASTALKING_USERNAME` | Africa's Talking account username |
| `AFRICASTALKING_API_KEY` | Africa's Talking API key |
| `MOMO_API_KEY` | MTN MoMo API key |
| `MOMO_API_SECRET` | MTN MoMo API secret |

---

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /api/token/` | Obtain JWT access + refresh tokens |
| `POST /api/token/refresh/` | Refresh access token |
| `POST /api/accounts/register/` | Register new user |
| `GET /api/accounts/me/` | Current user profile |
| `GET/POST /api/bookings/` | List / create bookings |
| `GET/POST /api/vehicles/` | List / create vehicles |
| `GET /api/branches/` | List branches |
| `GET /api/branches/services/` | List service types |
| `GET/POST /api/payments/` | List / initiate payments |

---

## Tech Stack

**Backend:** Django 4.2 · Django REST Framework · SimpleJWT · PostgreSQL · Celery · Redis · Django Channels · Daphne · Africa's Talking · MTN MoMo

**Frontend:** React 18 · Vite · Tailwind CSS · React Router · Axios · Leaflet · Recharts
