# 🏥 MediFlow — Complete Codebase Reference

> **Updated**: 2026-04-13 — Full architectural documentation including Departments, AI Integration, and RBAC.

---

## 📁 Project Structure

```
JEE/
├── docker-compose.yml
├── README.md
├── Prompt-JEE-Features.md
├── codebase_reference.md
├── backend/
│   ├── src/main/java/com/MediFlow/backend/
│   │   ├── BackendApplication.java
│   │   ├── DataSeeder.java            (Robust, selective seeding)
│   │   ├── controller/                (Department, Settings, AI Summary, etc.)
│   │   ├── dto/                       (PatientRequest, DashboardStats, ErrorResponse, etc.)
│   │   ├── entity/                    (Department, Patient, User, SystemSettings, Notification)
│   │   ├── enums/                     (PatientStatus, PriorityLevel, NotificationType, etc.)
│   │   ├── exception/                 (GlobalExceptionHandler)
│   │   ├── repository/                (All JPA Repositories)
│   │   ├── security/                  (JWT, RBAC, SecurityConfig)
│   │   └── service/                   (AiService, NotificationService, DashboardService, etc.)
└── frontend/
    └── src/app/
        ├── guards/                    (AdminGuard, DoctorGuard, etc.)
        ├── models/                    (Full relational models)
        ├── pages/                     (Dashboard, Patients, Admin, Settings, etc.)
        └── services/                  (Patient, Auth, Notification, Ai, etc.)
```

---

## 🛠️ Tech Stack

| Layer | Technology | Role |
|-------|-----------|------|
| **Backend** | Spring Boot 4.0.5 | Core Framework |
| **Language** | Java 17 | Logic & Concurrency |
| **Database** | PostgreSQL 15 | Relational Storage |
| **AI** | OpenRouter (AI Models) | Diagnostic Summaries |
| **Security** | Spring Security + JWT | RBAC & Auth |
| **Frontend** | Angular 21 | Logic & Navigation |
| **Styling** | Tailwind CSS v4 | UI System |
| **Real-time** | WebSockets | Notifications |

---

## ⚙️ Core Configuration

### application.properties
- `spring.jpa.hibernate.ddl-auto=update` (Use `create` for full schema refresh)
- `app.ai.api-key`: OpenRouter API Key
- `spring.config.import=optional:file:.env`

---

# 🔵 BACKEND — Source Reference

## Enums
- **PatientCondition**: `NORMAL`, `SERIOUS`, `CRITICAL`
- **PatientStatus**: `ADMITTED`, `UNDER_TREATMENT`, `DISCHARGED`
- **PriorityLevel**: `LOW`, `MEDIUM`, `HIGH`
- **BedStatus**: `AVAILABLE`, `OCCUPIED`
- **NotificationType**: `PATIENT_ASSIGNED`, `BED_CHANGE`, `CRITICAL_ALERT`, `SYSTEM`
- **UserRole**: `ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST`

## Key Entities

### Department.java
Core medical wards/departments (Cardiology, Neurology, etc.).
- `name`, `code`, `description`.
- Relationships: `rooms`, `patients` (One-to-Many).

### Patient.java
Expanded clinical record.
- `fullName`, `age`, `condition`, `status`, `priorityLevel`.
- `admissionDate`, `dischargeDate`.
- Relationships: `bed` (One-to-One), `department` (Many-to-One), `assignedDoctor` (Many-to-One).

### User.java
- `username`, `email`, `fullName`, `password`.
- `role` (Enum), `active` (boolean).

### SystemSettings.java
- `maxUsers`, `maxBeds`, `allowOverbooking`, `alertThreshold`.

## Advanced Services

### AiService.java
- Integrates with OpenRouter API to generate patient summaries.
- Methods: `generatePatientSummary(Patient patient)`.

### NotificationService.java
- Handles real-time system alerts.
- Methods: `sendNotification(String message, NotificationType type, String targetRoles)`.

### DashboardService.java
- Calculates complex stats: occupancy rates per department, doctor workloads, and critical patient counts.
- Dynamic filtering for Doctor-specific views.

## Controllers (API Summary)

| Endpoint | Purpose | Role Required |
|----------|---------|---------------|
| `GET /api/patients` | List all patients | ADMIN, DOCTOR, NURSE, RECP |
| `GET /api/dashboard/stats` | Global hospital stats | ADMIN, DOCTOR, NURSE |
| `GET /api/dashboard/doctor-stats` | personalized for logged-in doctor | DOCTOR |
| `GET /api/departments` | List medical departments | ALL (Auth) |
| `GET /api/patients/{id}/ai-summary` | Generate AI summary | ADMIN, DOCTOR, NURSE |
| `GET /api/notifications` | User alerts | ALL (Auth) |
| `GET /api/settings` | Configure hospital limits | ADMIN |

---

## 🛡️ Security & Roles
- **RBAC**: Implemented via `@PreAuthorize`.
- **JWT**: Stateless authentication with claims for `role` and `username`.
- **Method Security**: Controllers are locked down per-method (e.g., only RECEPTIONIST/ADMIN can create patients).

---

## 🔄 Data Seeding (DataSeeder.java)
- **Selective Population**: Smart logic that only seeds tables if empty.
- **Relational Integrity**: Automatically links Rooms to Departments, and Patients to Beds/Doctors/Departments by looking up existing entities.

---

# 🟢 FRONTEND — Key Features

- **Personalized Dashboards**: Doctors see only their own patients and workload.
- **Dynamic Filters**: Filter beds and patients by Department Code (e.g., DEP-ER).
- **Real-time Alerts**: Toast notifications and a bell icon for system-wide updates.
- **Clinical Details**: Clickable patient records with AI-generated summaries.
- **Role-based UI**: Navigation links and action buttons appear/disappear based on delegated permissions.
