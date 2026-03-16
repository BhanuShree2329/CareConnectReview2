# CareConnect — Full Stack Setup Guide

## What was fixed / completed
- ✅ **Backend** — Complete REST API for all dashboards (care requests, orphan requests, user management, NGO profiles)
- ✅ **Admin Dashboard** — Now shows real pending user registrations (NGOs, caretakers, elders) from database — approve/reject works
- ✅ **NGO Registration** — Extra NGO profile fields (org name, reg no, focus area, website, phone, address) stored in DB
- ✅ **Link NGO** — `/ngos` page lists all approved NGOs with search, accessible from nav and dashboards
- ✅ **All dashboards** — Connected to real backend (no more localStorage mock data)
- ✅ **Auth** — Real JWT-based login/register with role-based routing

---

## 1. Database Setup (MySQL)

```sql
-- Create database
CREATE DATABASE careconnect;
USE careconnect;

-- Then run the schema file:
SOURCE backend/database/schema.sql;
```

Or paste the contents of `backend/database/schema.sql` into your MySQL client.

---

## 2. Backend Setup

```bash
cd backend

# Edit .env — set your MySQL credentials:
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=careconnect

npm install
node server.js
# Server runs on http://localhost:5000
```

---

## 3. Frontend Setup

```bash
# From project root:
npm install
npm run dev
# App runs on http://localhost:8080 (or 5173)
```

---

## 4. First Login (Admin)

The schema seeds one admin account:
- **Email:** `admin@careconnect.com`  
- **Password:** `Admin@123`

Login → OTP sent to email → approve any pending users from Admin Dashboard.

---

## 5. Flow Overview

### NGO Registration Flow
1. NGO registers at `/register` → fills name/email/password + org details
2. Account created with `status: pending`
3. **Admin Dashboard → "Pending Users" tab** → NGO appears → Admin approves/rejects
4. After approval, NGO can log in and see orphan requests

### Care Request Flow
1. Elder submits request at `/care-request/new`
2. **Admin Dashboard → "Care Requests" tab** → Admin approves
3. **Caretaker Dashboard** → sees approved requests → accepts → marks complete

### Orphan Request Flow
1. Orphan submits request at `/orphan-request/new`
2. **Admin Dashboard → "Orphan Requests" tab** → Admin approves
3. **NGO Dashboard** → sees approved requests → accepts

### NGO Directory
- `/ngos` — public page, no login required
- Lists all approved NGOs with contact info
- Accessible via "NGO Directory" link in nav and dashboard header

---

## API Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | /api/register | — | Register any role |
| POST | /api/login | — | Login |
| GET | /api/me | any | Get current user |
| GET | /api/users/pending | admin | Pending user registrations |
| PUT | /api/users/:id/approve | admin | Approve user |
| PUT | /api/users/:id/reject | admin | Reject user |
| GET | /api/ngos | — | List approved NGOs (public) |
| POST | /api/care-requests | elder | Submit care request |
| GET | /api/care-requests/mine | elder | My care requests |
| GET | /api/care-requests | admin | All care requests |
| PUT | /api/care-requests/:id/approve | admin | Approve |
| PUT | /api/care-requests/:id/reject | admin | Reject |
| PUT | /api/care-requests/:id/accept | caretaker | Accept assignment |
| PUT | /api/care-requests/:id/complete | caretaker | Mark complete |
| POST | /api/orphan-requests | orphan/elder | Submit orphan request |
| GET | /api/orphan-requests/mine | orphan | My requests |
| GET | /api/orphan-requests | admin | All requests |
| GET | /api/orphan-requests/ngo | ngo | NGO view (approved + assigned) |
| PUT | /api/orphan-requests/:id/approve | admin | Approve |
| PUT | /api/orphan-requests/:id/reject | admin | Reject |
| PUT | /api/orphan-requests/:id/accept | ngo | NGO accepts |
| POST | /api/otp/send | — | Send OTP email |
| POST | /api/otp/verify | — | Verify OTP |
