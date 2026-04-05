# 🏥 MediFlow - Hospital Resource & Bed Management System

MediFlow is a comprehensive, full-stack Hospital Resource and Bed Management System designed to streamline hospital operations. It efficiently manages hospital beds (Normal, ICU), wards, medical equipment, and patient allocations while providing real-time analytics to healthcare professionals. 

The system enforces strict role-based access control (RBAC) to ensure different hospital personnel have the appropriate permissions based on their responsibilities.

---

## 🌟 Key Features

### 🔐 Role-Based Access Control
- **👑 Admin:** Full system configuration, user management, and global oversight.
- **👨‍⚕️ Doctor:** Patient management, critical condition toggling, and bed allocation requests.
- **👩‍⚕️ Nurse:** Patient condition updates, bed assignments, and discharges.
- **🧑‍💼 Receptionist:** Patient registration, basic admission, and availability monitoring.

### 🧠 Smart Bed Allocation
- Automated logic to prioritize **ICU beds** for `CRITICAL` patients and **Normal beds** for others.
- Emergency mode support with alerts when ICU capacity is reached.

### 📊 Real-Time Analytics Dashboard
- Live KPIs for hospital occupancy rates.
- Charts visualizing resource usage and patient intake over time.
- Immediate alerts for critical operations.

### 🛏️ Comprehensive Resource Tracking
- Full CRUD capabilities for Patients, Beds, Rooms, and Medical Equipment.
- Visual grid implementations for bed tracking (Available vs. Occupied).

---

## 🛠️ Technology Stack

**Backend (Spring Boot)**
- Java Spring Boot 3/4
- Spring Security + JWT Authentication
- Spring Data JPA (Hibernate)
- PostgreSQL Database
- Docker & Docker Compose

**Frontend (Angular)**
- Angular 17+ (Standalone Components)
- Tailwind CSS for modern, responsive UI styling
- Chart.js integration for dashboard visualizations
- Secure token persistence & HTTP Interceptors

---

## 🚀 Getting Started

### 🔑 Environment Configuration (For Collaborators)
Before running the application, you must configure the environment variables for both the backend and frontend. We use `.env.example` files as templates.

1. **Backend:** Duplicate `backend/.env.example` and rename it to `backend/.env`. Fill in your PostgreSQL database credentials (`DB_PASSWORD`) and a secure `JWT_SECRET`.
2. **Frontend:** Duplicate `frontend/.env.example` and rename it to `frontend/.env`. Ensure the `API_URL` points to your running backend instance.

**Note:** Never commit actual `.env` files to version control. They are already added to `.gitignore`.

### 🐳 Running with Docker (Recommended)

The easiest way to run the entire stack (PostgreSQL Database, Spring Boot Backend, Angular Frontend) is using Docker Compose. The environment is pre-configured to be stateful and connect seamlessly.

#### Prerequisites
- **Docker** and **Docker Compose** installed on your machine.

#### Steps
1. Navigate to the root directory `JEE`.
2. Run the following command to build and start all services in the background:
   ```bash
   docker-compose up -d --build
   ```
3. Access the application in your browser at `http://localhost:4200`.
4. The backend API will be available at `http://localhost:8080/api/v1`.

*Note: The database state is persisted automatically through a Docker volume (`postgres_data`). To stop the application without losing data, simply run `docker-compose down`.*

---

### 💻 Manual Setup (Alternative)

#### Prerequisites
- **Java 17+** installed
- **Node.js** (v18+) and **npm** installed
- **Angular CLI** installed globally (`npm install -g @angular/cli`)
- **PostgreSQL** installed and running

### 1. Backend Setup (Spring Boot)
1. Open your PostgreSQL terminal and create a database:
   ```sql
   CREATE DATABASE mediflow_db;
   ```
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Create a `.env` file in the `backend` directory based on the `.env.example` template:
   ```bash
   cp .env.example .env
   ```
   *Make sure to update `DB_PASSWORD` and `JWT_SECRET` with your own secure values.*
4. Run the Spring Boot application using Maven:
   ```bash
   mvn spring-boot:run
   ```
   *The backend will typically start on `http://localhost:8080`.*

### 2. Frontend Setup (Angular)
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the necessary NPM dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend` directory based on the `.env.example` template:
   ```bash
   cp .env.example .env
   ```
4. Start the Angular development server:
   ```bash
   npm run start
   # or
   ng serve
   ```
4. Access the application in your browser at `http://localhost:4200`.

---

## 📁 Project Architecture

```
MediFlow/
├── backend/               # Spring Boot Application
│   ├── src/main/java...   # Controllers, Services, Security, Entities
│   └── pom.xml            # Maven Configuration
├── frontend/              # Angular Application
│   ├── src/app/...        # Components, Guards, Services
│   └── package.json       # NPM Dependencies
└── README.md              # Project Documentation
```

---

## 🔒 Security
All protected endpoints require a valid JSON Web Token (JWT) provided in the `Authorization: Bearer <token>` header. The Angular frontend automatically intercept HTTP requests to inject this token once a user successfully logs in. Route Guards are utilized to prevent unauthorized access to specific dashboard views.
