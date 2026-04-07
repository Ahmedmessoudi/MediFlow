# 🏥 MediFlow — Complete Codebase Reference

> **Generated**: 2026-04-07 — Every file in the project, organized for quick lookup.

---

## 📁 Project Structure

```
JEE/
├── docker-compose.yml
├── README.md
├── Prompt.md
├── backend/
│   ├── pom.xml
│   ├── Dockerfile
│   ├── .env / .env.example
│   └── src/main/java/com/MediFlow/backend/
│       ├── BackendApplication.java
│       ├── DataSeeder.java
│       ├── controller/
│       │   ├── AuthController.java
│       │   ├── BedController.java
│       │   ├── DashboardController.java
│       │   ├── EquipmentController.java
│       │   ├── PatientController.java
│       │   ├── RoomController.java
│       │   └── UserController.java
│       ├── dto/
│       │   ├── AuthResponse.java
│       │   ├── DashboardStats.java
│       │   ├── LoginRequest.java
│       │   └── RegisterRequest.java
│       ├── entity/
│       │   ├── Bed.java
│       │   ├── Equipment.java
│       │   ├── Patient.java
│       │   ├── Room.java
│       │   └── User.java
│       ├── enums/
│       │   ├── BedStatus.java        (AVAILABLE, OCCUPIED)
│       │   ├── BedType.java          (NORMAL, ICU)
│       │   ├── EquipmentStatus.java  (AVAILABLE, IN_USE)
│       │   ├── PatientCondition.java (NORMAL, SERIOUS, CRITICAL)
│       │   └── UserRole.java         (ADMIN, DOCTOR, NURSE, RECEPTIONIST)
│       ├── repository/
│       │   ├── BedRepository.java
│       │   ├── EquipmentRepository.java
│       │   ├── PatientRepository.java
│       │   ├── RoomRepository.java
│       │   └── UserRepository.java
│       ├── security/
│       │   ├── CustomUserDetailsService.java
│       │   ├── JwtAuthFilter.java
│       │   ├── JwtUtil.java
│       │   └── SecurityConfig.java
│       └── service/
│           ├── AuthService.java
│           ├── BedService.java
│           ├── DashboardService.java
│           ├── EquipmentService.java
│           ├── PatientService.java
│           └── RoomService.java
└── frontend/
    ├── package.json
    ├── angular.json
    ├── Dockerfile
    ├── nginx.conf
    ├── .env / .env.example
    └── src/
        ├── styles.css
        └── app/
            ├── app.ts
            ├── app.config.ts
            ├── app.routes.ts
            ├── guards/auth.guard.ts
            ├── interceptors/auth.interceptor.ts
            ├── layout/
            │   ├── layout.component.ts
            │   ├── sidebar.component.ts
            │   └── topbar.component.ts
            ├── models/
            │   ├── bed.model.ts
            │   ├── dashboard.model.ts
            │   ├── equipment.model.ts
            │   ├── patient.model.ts
            │   ├── room.model.ts
            │   └── user.model.ts
            ├── pages/
            │   ├── admin/admin.component.ts
            │   ├── beds/beds.component.ts
            │   ├── dashboard/dashboard.component.ts
            │   ├── login/login.component.ts
            │   ├── not-found/not-found.component.ts
            │   ├── patients/patients.component.ts
            │   └── rooms/rooms.component.ts
            └── services/
                ├── auth.service.ts
                ├── bed.service.ts
                ├── dashboard.service.ts
                ├── equipment.service.ts
                ├── patient.service.ts
                ├── room.service.ts
                └── user.service.ts
```

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Backend Framework | Spring Boot | 4.0.5 |
| Language | Java | 17 |
| Database | PostgreSQL | 15 (Alpine) |
| ORM | Spring Data JPA / Hibernate | — |
| Security | Spring Security + JWT (jjwt 0.12.6) | — |
| Frontend Framework | Angular (Standalone) | 21.2 |
| Styling | Tailwind CSS | v4.1.12 |
| Charts | Chart.js + ng2-charts | 4.5.1 / 10.0 |
| Icons | Inline SVGs (Lucide-style) | — |
| Build | Maven (backend) / Angular CLI (frontend) | — |
| Containerization | Docker + Docker Compose | 3.8 |

---

## ⚙️ Configuration

### application.properties
```properties
spring.config.import=optional:file:.env
spring.application.name=MediFlow
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.format_sql=true
app.jwt.secret=${JWT_SECRET}
app.jwt.expiration-ms=${JWT_EXPIRATION}
server.port=${SERVER_PORT}
app.cors.allowed-origins=${CORS_ALLOWED_ORIGINS}
```

### docker-compose.yml
- **mediflow-db**: postgres:15-alpine on port 5432, DB=mediflow_db
- **mediflow-backend**: builds ./backend, port 8080, env_file=./backend/.env, overrides DB_URL to `jdbc:postgresql://mediflow-db:5432/mediflow_db`
- **mediflow-frontend**: builds ./frontend, port 4200→80

---

# 🔵 BACKEND — Full Source Code

---

## Enums

### PatientCondition.java
```java
package com.MediFlow.backend.enums;
public enum PatientCondition {
    NORMAL, SERIOUS, CRITICAL
}
```

### UserRole.java
```java
package com.MediFlow.backend.enums;
public enum UserRole {
    ADMIN, DOCTOR, NURSE, RECEPTIONIST
}
```

### BedStatus.java
```java
package com.MediFlow.backend.enums;
public enum BedStatus {
    AVAILABLE, OCCUPIED
}
```

### BedType.java
```java
package com.MediFlow.backend.enums;
public enum BedType {
    NORMAL, ICU
}
```

### EquipmentStatus.java
```java
package com.MediFlow.backend.enums;
public enum EquipmentStatus {
    AVAILABLE, IN_USE
}
```

---

## Entities

### Patient.java
```java
package com.MediFlow.backend.entity;
import com.MediFlow.backend.enums.PatientCondition;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "patients")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Patient {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Integer age;

    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private PatientCondition condition;

    @Column(nullable = false)
    private LocalDateTime admissionDate;

    private LocalDateTime dischargeDate;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "bed_id", unique = true)
    private Bed bed;
}
```

### User.java
```java
package com.MediFlow.backend.entity;
import com.MediFlow.backend.enums.UserRole;
import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private UserRole role;
}
```

### Bed.java
```java
package com.MediFlow.backend.entity;
import com.MediFlow.backend.enums.BedStatus;
import com.MediFlow.backend.enums.BedType;
import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "beds")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Bed {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private BedType type;

    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private BedStatus status;

    @Column(unique = true)
    private String bedNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "room_id")
    private Room room;
}
```

### Room.java
```java
package com.MediFlow.backend.entity;
import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "rooms")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Room {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String ward;       // ← ward is just a String, NOT a FK

    @Column(nullable = false)
    private Integer capacity;
}
```

### Equipment.java
```java
package com.MediFlow.backend.entity;
import com.MediFlow.backend.enums.EquipmentStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "equipment")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Equipment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type;

    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private EquipmentStatus status;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "room_id")
    private Room room;
}
```

---

## DTOs

### LoginRequest.java
```java
package com.MediFlow.backend.dto;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class LoginRequest {
    @NotBlank private String username;
    @NotBlank private String password;
}
```

### RegisterRequest.java
```java
package com.MediFlow.backend.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class RegisterRequest {
    @NotBlank private String username;
    @NotBlank private String password;
    @NotNull  private String role;
}
```

### AuthResponse.java
```java
package com.MediFlow.backend.dto;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AuthResponse {
    private String token;
    private String username;
    private String role;
}
```

### DashboardStats.java
```java
package com.MediFlow.backend.dto;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DashboardStats {
    private long totalBeds;
    private long occupiedBeds;
    private long availableBeds;
    private double occupancyRate;
    private double icuUsagePercent;
    private long totalPatients;
    private long criticalPatients;
    private long totalRooms;
    private long totalEquipment;
}
```

---

## Repositories

### PatientRepository.java
```java
@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByBedId(Long bedId);
}
```

### UserRepository.java
```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
}
```

### BedRepository.java
```java
@Repository
public interface BedRepository extends JpaRepository<Bed, Long> {
    List<Bed> findByStatus(BedStatus status);
    List<Bed> findByTypeAndStatus(BedType type, BedStatus status);
    Optional<Bed> findFirstByTypeAndStatus(BedType type, BedStatus status);
    long countByStatus(BedStatus status);
    long countByType(BedType type);
    long countByTypeAndStatus(BedType type, BedStatus status);
}
```

### RoomRepository.java
```java
@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {}
```

### EquipmentRepository.java
```java
@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, Long> {
    List<Equipment> findByStatus(EquipmentStatus status);
}
```

---

## Services

### AuthService.java
```java
@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    // Constructor injection (4 params)

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        User user = userRepository.findByUsername(request.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found"));
        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
        return AuthResponse.builder().token(token).username(user.getUsername()).role(user.getRole().name()).build();
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername()))
            throw new RuntimeException("Username already exists");
        UserRole role = UserRole.valueOf(request.getRole().toUpperCase());
        User user = User.builder()
            .username(request.getUsername())
            .password(passwordEncoder.encode(request.getPassword()))
            .role(role).build();
        userRepository.save(user);
        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
        return AuthResponse.builder().token(token).username(user.getUsername()).role(user.getRole().name()).build();
    }
}
```

### PatientService.java
```java
@Service
public class PatientService {
    private final PatientRepository patientRepository;
    private final BedRepository bedRepository;

    public List<Patient> findAll() { return patientRepository.findAll(); }
    public Patient findById(Long id) { return patientRepository.findById(id).orElseThrow(...); }

    public Patient create(Patient patient) {
        patient.setAdmissionDate(LocalDateTime.now());
        return patientRepository.save(patient);
    }

    public Patient update(Long id, Patient updatedPatient) {
        Patient patient = findById(id);
        patient.setName(updatedPatient.getName());
        patient.setAge(updatedPatient.getAge());
        patient.setCondition(updatedPatient.getCondition());
        return patientRepository.save(patient);
    }

    public void delete(Long id) {
        Patient patient = findById(id);
        if (patient.getBed() != null) {
            Bed bed = patient.getBed();
            bed.setStatus(BedStatus.AVAILABLE);
            bedRepository.save(bed);
        }
        patientRepository.deleteById(id);
    }

    @Transactional
    public Patient allocateBed(Long patientId) {
        // CRITICAL → ICU, otherwise → NORMAL
        // finds first available bed of required type
    }

    @Transactional
    public Patient discharge(Long patientId) {
        // releases bed, sets dischargeDate
    }

    public Patient markCritical(Long patientId) {
        // sets condition to CRITICAL
    }
}
```

### BedService.java
```java
@Service
public class BedService {
    private final BedRepository bedRepository;
    // CRUD: findAll, findById, findAvailable, create, update, delete
}
```

### RoomService.java
```java
@Service
public class RoomService {
    private final RoomRepository roomRepository;
    // CRUD: findAll, findById, create, update (name, ward, capacity), delete
}
```

### EquipmentService.java
```java
@Service
public class EquipmentService {
    private final EquipmentRepository equipmentRepository;
    // CRUD: findAll, findById, create, update (name, type, status, room), delete
}
```

### DashboardService.java
```java
@Service
public class DashboardService {
    // Injects: BedRepository, PatientRepository, RoomRepository, EquipmentRepository
    public DashboardStats getStats() {
        // Computes: totalBeds, occupiedBeds, availableBeds, occupancyRate,
        //           icuUsagePercent, totalPatients, criticalPatients, totalRooms, totalEquipment
    }
}
```

---

## Controllers (API Routes)

### AuthController — `/api/auth`
| Method | Path | Auth | Body |
|--------|------|------|------|
| POST | `/login` | Public | LoginRequest |
| POST | `/register` | Public | RegisterRequest |

### PatientController — `/api/patients`
| Method | Path | Roles | Body |
|--------|------|-------|------|
| GET | `/` | ALL | — |
| GET | `/{id}` | ALL | — |
| POST | `/` | ADMIN, RECEPTIONIST | Patient |
| PUT | `/{id}` | ADMIN, NURSE | Patient |
| DELETE | `/{id}` | ADMIN | — |
| POST | `/{id}/allocate` | ADMIN, DOCTOR, NURSE | — |
| POST | `/{id}/discharge` | ADMIN, NURSE | — |
| PUT | `/{id}/mark-critical` | ADMIN, DOCTOR | — |

### BedController — `/api/beds`
| Method | Path | Roles |
|--------|------|-------|
| GET | `/` | ALL |
| GET | `/available` | ALL |
| GET | `/{id}` | ALL |
| POST | `/` | ADMIN |
| PUT | `/{id}` | ADMIN |
| DELETE | `/{id}` | ADMIN |

### RoomController — `/api/rooms`
| Method | Path | Roles |
|--------|------|-------|
| GET | `/` | ADMIN, DOCTOR, NURSE |
| GET | `/{id}` | ADMIN, DOCTOR, NURSE |
| POST | `/` | ADMIN |
| PUT | `/{id}` | ADMIN |
| DELETE | `/{id}` | ADMIN |

### EquipmentController — `/api/equipment`
| Method | Path | Roles |
|--------|------|-------|
| GET | `/` | ADMIN, DOCTOR, NURSE |
| GET | `/{id}` | ADMIN, DOCTOR, NURSE |
| POST | `/` | ADMIN |
| PUT | `/{id}` | ADMIN |
| DELETE | `/{id}` | ADMIN |

### DashboardController — `/api/dashboard`
| Method | Path | Roles |
|--------|------|-------|
| GET | `/stats` | ADMIN, DOCTOR, NURSE |

### UserController — `/api/users`
| Method | Path | Roles |
|--------|------|-------|
| GET | `/` | ADMIN |
| DELETE | `/{id}` | ADMIN |

> [!IMPORTANT]
> **UserController has NO create/update/activate/deactivate.** It only lists and deletes.
> User creation happens via `AuthController.register` which is PUBLIC (no admin check!).

---

## Security

### SecurityConfig.java
```java
@Configuration @EnableWebSecurity @EnableMethodSecurity
public class SecurityConfig {
    // CORS: configurable origins from app.cors.allowed-origins
    // CSRF: disabled
    // Sessions: STATELESS
    // Public: /api/auth/**
    // All other requests: authenticated
    // JWT filter before UsernamePasswordAuthenticationFilter
    // PasswordEncoder: BCryptPasswordEncoder
}
```

### JwtUtil.java
- Signs with HMAC-SHA from `app.jwt.secret` (min 32 chars)
- Exp from `app.jwt.expiration-ms`
- Claims include `role`
- Methods: generateToken, extractUsername, extractRole, isTokenValid, isTokenExpired

### JwtAuthFilter.java
- Extends OncePerRequestFilter
- Extracts Bearer token → validates → sets SecurityContext

### CustomUserDetailsService.java
- Loads User from DB, maps to Spring Security UserDetails
- Authority: `ROLE_<UserRole.name()>`

---

## DataSeeder.java
Seeds on first run (if userRepository.count() > 0, skips):

**Users:**
| Username | Password | Role |
|----------|----------|------|
| admin | admin | ADMIN |
| dr.smith | doctor | DOCTOR |
| nurse.jones | nurse | NURSE |
| dr.williams | doctor | DOCTOR |
| receptionist01 | reception | RECEPTIONIST |

**Rooms:** Room 101 (Ward A, cap 4), Room 102 (Ward A, cap 2), ICU Suite 1 (ICU, cap 6), Room 201 (Ward B, cap 4), Room 301 (Ward C, cap 3), ER Bay 1 (Emergency, cap 8)

**Beds:** 12 beds total — A-101..A-104 (Normal, roomA101), A-110..A-111 (Normal, roomA102), ICU-01..ICU-04 (ICU, icuSuite), B-201..B-202 (Normal, roomB201)

**Patients:** 6 patients — John Doe(45,NORMAL,bedA101), Jane Smith(32,CRITICAL,bedICU01), Robert Brown(67,SERIOUS,bedB202), Emily Davis(28,NORMAL,bedA103), Michael Wilson(54,CRITICAL,bedICU03), Sarah Johnson(41,SERIOUS,no bed)

**Equipment:** 6 items — Ventilator V-100, Monitor M-200, Defibrillator D-50, Infusion Pump IP-30, Ventilator V-101, X-Ray XR-01

---

# 🟢 FRONTEND — Full Source Code

---

## Global Styles (styles.css)

```css
@import 'tailwindcss';

@theme {
  --font-sans: 'Inter', system-ui, sans-serif;

  /* Color tokens */
  --color-border: hsl(214, 32%, 91%);
  --color-input: hsl(214, 32%, 91%);
  --color-ring: hsl(217, 91%, 60%);
  --color-background: hsl(210, 20%, 98%);
  --color-foreground: hsl(220, 20%, 10%);
  --color-card: hsl(0, 0%, 100%);
  --color-primary: hsl(217, 91%, 60%);
  --color-primary-foreground: hsl(0, 0%, 100%);
  --color-muted: hsl(210, 20%, 96%);
  --color-muted-foreground: hsl(215, 16%, 47%);
  --color-destructive: hsl(0, 72%, 51%);
  --color-success: hsl(142, 71%, 45%);
  --color-warning: hsl(38, 92%, 50%);
  --color-sidebar: hsl(220, 20%, 10%);
  --color-sidebar-foreground: hsl(210, 20%, 90%);
  --color-sidebar-primary: hsl(217, 91%, 60%);
  --color-sidebar-accent: hsl(220, 20%, 16%);
  --color-sidebar-border: hsl(220, 20%, 18%);

  /* Animations */
  --animate-fade-in: fade-in 0.3s ease-out;
  --animate-pulse-soft: pulse-soft 2s ease-in-out infinite;
  --animate-slide-in: slide-in 0.25s ease-out;
}

.gradient-medical { background: linear-gradient(135deg, hsl(217,91%,60%), hsl(200,80%,50%)); }
```

---

## App Bootstrap

### app.ts
```typescript
@Component({ selector: 'app-root', standalone: true, imports: [RouterOutlet], template: `<router-outlet />` })
export class App {}
```

### app.config.ts
```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),
  ]
};
```

### app.routes.ts
```typescript
export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
      { path: 'patients', component: PatientsComponent, canActivate: [authGuard] },
      { path: 'beds', component: BedsComponent, canActivate: [authGuard] },
      { path: 'rooms', component: RoomsComponent, canActivate: [authGuard] },
      { path: 'admin', component: AdminComponent, canActivate: [authGuard] },
    ]
  },
  { path: '**', component: NotFoundComponent },
];
```

---

## Models

### patient.model.ts
```typescript
export type PatientCondition = 'NORMAL' | 'SERIOUS' | 'CRITICAL';
export interface Patient {
  id?: number;
  name: string;
  age: number;
  condition: PatientCondition;
  admissionDate?: string;
  dischargeDate?: string;
  bed?: Bed | null;
}
```

### user.model.ts
```typescript
export type UserRole = 'ADMIN' | 'DOCTOR' | 'NURSE' | 'RECEPTIONIST';
export interface AppUser { id?: number; username: string; role: UserRole; password?: string; }
export interface LoginRequest { username: string; password: string; }
export interface RegisterRequest { username: string; password: string; role: string; }
export interface AuthResponse { token: string; username: string; role: UserRole; }

export const ROLE_ROUTES: Record<UserRole, string[]> = {
  ADMIN: ['/dashboard', '/patients', '/beds', '/rooms', '/admin'],
  DOCTOR: ['/dashboard', '/patients', '/beds'],
  NURSE: ['/dashboard', '/patients', '/beds'],
  RECEPTIONIST: ['/patients', '/beds'],
};

export const ROLE_DEFAULT_ROUTE: Record<UserRole, string> = {
  ADMIN: '/dashboard', DOCTOR: '/dashboard', NURSE: '/dashboard', RECEPTIONIST: '/patients',
};

export type Permission = 'patient:create' | 'patient:read' | 'patient:update' | 'patient:delete'
  | 'patient:update_condition' | 'patient:assign_bed' | 'patient:discharge'
  | 'bed:read' | 'bed:manage' | 'room:read' | 'room:manage'
  | 'equipment:read' | 'equipment:manage' | 'user:manage'
  | 'dashboard:full' | 'dashboard:limited';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [/* all permissions */],
  DOCTOR: ['patient:read', 'patient:update_condition', 'bed:read', 'dashboard:limited'],
  NURSE: ['patient:read', 'patient:update', 'patient:assign_bed', 'patient:discharge', 'bed:read', 'bed:manage', 'dashboard:limited'],
  RECEPTIONIST: ['patient:create', 'patient:read', 'bed:read'],
};
```

### bed.model.ts
```typescript
export type BedType = 'NORMAL' | 'ICU';
export type BedStatus = 'AVAILABLE' | 'OCCUPIED';
export interface Bed { id?: number; bedNumber: string; type: BedType; status: BedStatus; room?: Room | null; }
```

### room.model.ts
```typescript
export interface Room { id?: number; name: string; ward: string; capacity: number; }
```

### equipment.model.ts
```typescript
export type EquipmentStatus = 'AVAILABLE' | 'IN_USE';
export interface Equipment { id?: number; name: string; type: string; status: EquipmentStatus; room?: any; }
```

### dashboard.model.ts
```typescript
export interface DashboardStats {
  totalBeds: number; occupiedBeds: number; availableBeds: number;
  occupancyRate: number; icuUsagePercent: number;
  totalPatients: number; criticalPatients: number;
  totalRooms: number; totalEquipment: number;
}
```

---

## Services

### auth.service.ts
```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = '/api/auth';
  // Stores: mediflow_token, mediflow_user, mediflow_role in localStorage
  currentUser = signal<string | null>(...);
  currentRole = signal<UserRole | null>(...);
  isLoggedIn = computed(() => !!this.currentUser() && !!this.getToken());

  login(request): Observable<AuthResponse>    // POST /api/auth/login
  register(request): Observable<AuthResponse> // POST /api/auth/register
  logout(): void                               // Clears localStorage, navigates to /login
  getToken(): string | null
  hasPermission(permission: Permission): boolean
  canAccessRoute(route: string): boolean
  getAllowedRoutes(): string[]
  getDefaultRoute(): string
}
```

### patient.service.ts — `/api/patients`
Methods: getAll, getById, create, update, delete, allocateBed, discharge, markCritical

### bed.service.ts — `/api/beds`
Methods: getAll, getAvailable, getById, create, update, delete

### room.service.ts — `/api/rooms`
Methods: getAll, create, update, delete

### equipment.service.ts — `/api/equipment`
Methods: getAll, create, update, delete

### dashboard.service.ts — `/api/dashboard`
Methods: getStats

### user.service.ts — `/api/users` + `/api/auth`
Methods: getAll (GET /api/users), create (POST /api/auth/register), delete (DELETE /api/users/{id})

---

## Guards & Interceptors

### auth.guard.ts
```typescript
export const authGuard: CanActivateFn = (route, state) => {
  // Checks isLoggedIn → redirects to /login
  // Checks canAccessRoute → redirects to default route
};
```

### auth.interceptor.ts
```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Adds Authorization: Bearer <token> header if token exists
};
```

---

## Layout Components

### layout.component.ts
- Wrapper: sidebar + topbar + `<router-outlet>`
- Signal: `sidebarCollapsed`
- Classes: `h-screen flex w-full overflow-hidden bg-background`

### sidebar.component.ts
- Input: `collapsed` signal
- Nav items filtered by `auth.getAllowedRoutes()`
- Items: Dashboard(/dashboard), Patients(/patients), Beds(/beds), Rooms & Equipment(/rooms), Admin(/admin)
- Icons: inline SVGs in `getIcon()` method
- Dark sidebar (bg-sidebar, text-sidebar-foreground)
- Width: w-52 (expanded) / w-14 (collapsed)

### topbar.component.ts
- Height: h-12
- Shows: sidebar toggle, title, notification bell, user info (username + role badge)
- Role badge colors: ADMIN=primary, DOCTOR=success, NURSE=warning, RECEPTIONIST=muted

---

## Page Components

### login.component.ts
- Role selector (4 cards: Admin/Doctor/Nurse/Receptionist)
- Username + Password inputs
- Default credentials pre-filled (admin/admin)
- On submit → calls auth.login() → navigates to role's default route
- Gradient medical background with decorative circles

### dashboard.component.ts
- 4 KPI cards (Total Beds, Occupied, Available, ICU Usage) from DashboardService
- Line chart (Bed Usage Over Time — mock weekly data)
- Doughnut chart (Bed Distribution — mock data)
- Active Alerts section (hardcoded alerts)
- Full dashboard for ADMIN, limited for DOCTOR/NURSE

### patients.component.ts
- Table: Name, Age, Condition (badge), Bed, Status, Actions
- Search input filters by name
- Add Patient dialog: name, age, condition (dropdown)
- Actions per RBAC: mark critical, assign bed, discharge, delete
- Condition badges: NORMAL=green, SERIOUS=yellow, CRITICAL=red

### beds.component.ts
- Card grid layout (not table)
- Filters: type (All/ICU/Normal), status (All/Available/Occupied), ward
- Each card: bed number, type badge, status dot, patient name if occupied, ward/room info
- Left border color: green=available, red=occupied

### rooms.component.ts
- Tab switcher: Rooms / Equipment
- Rooms tab: table with Room, Ward, Capacity, Occupied, Availability (progress bar)
- Equipment tab: table with Name, Type, Status (badge)
- Occupancy progress bar: green < 70%, yellow 70-90%, red ≥ 90%

### admin.component.ts
- Users table: Username, Role (badge), Actions (delete)
- Add User dialog: username, password, role (dropdown)
- Creates via userService.create() which calls /api/auth/register
- Role badges: same color scheme as topbar

---

## Key Gaps / Issues Identified

> [!WARNING]
> These are issues in the current codebase that the enhancement must address:

1. **No Ward entity** — `ward` is a plain String on Room. No Ward table/API exists.
2. **User has no `email`, `fullName`, or `status` field** — only username/password/role.
3. **Patient has minimal fields** — only name, age, condition. Missing: gender, DOB, phone, address, emergency contact, medical notes.
4. **No user update/activate/deactivate** — UserController only has GET all + DELETE.
5. **Register is public** — anyone can create any role user without admin auth.
6. **No input validation DTOs for Patient** — controller accepts raw entity.
7. **Equipment linked to Room only** — not to Ward.
8. **No patient detail view** — table shows all info inline, no click-to-expand.
9. **No `UserService` on backend** — UserController directly calls repository.
10. **No global exception handler** — errors return Spring's default error response.
