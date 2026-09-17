# Event Management & Ticket Booking System

A full-stack event management and ticket booking platform built for CIA-3 (P13).

## Stack
- **Backend:** Node.js, Express.js, MongoDB (Atlas), Mongoose, JWT, bcrypt
- **Frontend:** React, Vite, Tailwind CSS, Axios, React Router

## Getting Started

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in your MONGO_URI, JWT_SECRET etc.
npm run dev
```

### 2. Seed Demo Data

```bash
cd backend
npm run seed
```

**Demo Accounts:**
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@eventix.com | Admin@123456 |
| Organizer | organizer@eventix.com | Organizer@123456 |
| User | user1@eventix.com | User@123456 |

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_BASE_URL=http://localhost:5000/api/v1
npm run dev
```

## API Base URL
`/api/v1`

## Vercel deployment

Deploy the backend from the repository root and the frontend as a second Vercel
project with `frontend` as its Root Directory. Configure Vercel environment
variables in the dashboard; do not commit `.env` files.

Backend production variables:
- `MONGO_URI` — MongoDB Atlas connection string for the `event-management` database
- `JWT_SECRET` — a strong, unique secret
- `JWT_EXPIRE` — for example, `30d`
- `NODE_ENV` — `production`
- `FRONTEND_URL` — the final frontend production URL

Frontend production variable:
- `VITE_API_BASE_URL` — `<backend-production-url>/api/v1`

After both deployments, set `FRONTEND_URL` to the frontend URL, redeploy the
backend, then update `VITE_API_BASE_URL` and redeploy the frontend. Confirm
`<backend-production-url>/api/v1/events` responds and that the browser can load
events from the frontend without a CORS error.

## Features
- Authentication (JWT, bcrypt, role-based)
- Event Management (CRUD, status, categories, venues)
- Ticket Types & Inventory (atomic reservation)
- Booking & Payment (simulated demo payment)
- Reviews & Ratings
- Notifications
- Advanced Search & Filtering
- Admin Dashboard & Analytics
