# CareConnect — Setup & Fix Guide

## What Was Fixed

### 1. ✅ Frontend (src/ folder) — Built from scratch
The entire `src/` directory was missing from the project. All pages have been created:
- `src/main.tsx` — App entry point
- `src/index.css` — Tailwind CSS styles
- `src/App.tsx` — Routes and role-based navigation
- `src/context/AuthContext.tsx` — Login/logout state management
- `src/components/layout/Layout.tsx` — Sidebar layout
- `src/pages/LoginPage.tsx` — Login page
- `src/pages/RegisterPage.tsx` — Registration (all roles, fixed submit button)
- `src/pages/OtpVerifyPage.tsx` — OTP verification page
- `src/pages/admin/AdminDashboard.tsx` — Admin overview
- `src/pages/admin/AdminUsersPage.tsx` — Approve/reject users
- `src/pages/admin/AdminOrphansPage.tsx` — Review orphan requests + assign NGOs
- `src/pages/orphan/OrphanDashboard.tsx` — Orphan's own request status
- `src/pages/orphan/OrphanRegisterRequest.tsx` — Submit support request
- `src/pages/ngo/NgoDashboard.tsx` — NGO view of assigned cases
- `src/pages/elder/elderDashboard.tsx`
- `src/pages/caretaker/CaretakerDashboard.tsx`

### 2. ✅ Registration Button Fix
Was broken because the `src/` folder didn't exist. `RegisterPage.tsx` now correctly calls `POST /api/register`.

### 3. ✅ OTP Email Fix
**Root cause:** The Gmail App Password in `.env` may be expired or invalid.

**Fix — generate a new App Password:**
1. Go to https://myaccount.google.com/security
2. Enable **2-Step Verification** (required)
3. Under 2-Step Verification → scroll to bottom → **App passwords**
4. Choose "Mail" → **Generate**
5. Copy the 16-character code (no spaces)
6. Open `backend/.env` and replace `EMAIL_PASS=` value with the new code

Also changed SMTP from port 465 (SSL) → **port 587 (STARTTLS)** which is more firewall-friendly.

**Fallback:** If email is still not working, the OTP is printed to the server console:
```
📧 [FALLBACK OTP] user@email.com → Check DB or fix email config
```

### 4. ✅ Orphan Dashboard — New Feature
Full workflow implemented:

| Role | What they can do |
|------|-----------------|
| Orphan | Register, submit support requests, track status |
| Admin | View all requests, approve/reject, assign NGO |
| NGO | View assigned cases, accept open requests |

New backend endpoint added: `PUT /api/orphan-requests/:id/assign-ngo` (admin only)

---

## How to Run

### 1. Database
```sql
-- In MySQL:
CREATE DATABASE careconnect;
USE careconnect;
-- Run backend/database/schema.sql
```

### 2. Backend
```bash
cd backend
npm install
# Edit .env — set DB_PASSWORD and a fresh EMAIL_PASS
node server.js
# Runs on http://localhost:5000
```

### 3. Frontend
```bash
# From project root
npm install
npm run dev
# Opens at http://localhost:5173
```

Or run both together:
```bash
npm run dev   # runs concurrently (client + server)
```

### Default Admin Login
- Email: `admin@careconnect.com`
- Password: `Admin@123`

---

## Orphan Flow Summary

```
Orphan registers → Admin approves account
Orphan submits request → Admin reviews
Admin approves request → Admin assigns NGO
NGO sees assignment → NGO accepts and contacts orphan
```
