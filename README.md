# Enterprise Cyber Defense & Attack Path Intelligence Platform

An enterprise-grade, modular cybersecurity platform unifying 9 core SOC modules into a single Security Command Center:
1. Asset Discovery & Inventory
2. Vulnerability & Exposure Management
3. Threat & Network Detection Engine (Sigma & Suricata Parsing)
4. Deception & Honeypot Framework (Safe Lab Deception)
5. Alert Correlation & Threat Intelligence (MITRE ATT&CK Mapping)
6. Attack Path & Risk Analysis (Reachability Topology Graph & Factor Scoring)
7. Incident Investigation & Controlled Response (Safe Simulation Framework)
8. Global SOC Search & Telemetry Stream
9. Security Command Center Dashboard & Integration

---

## 🏛️ System Architecture

```
Browser (Next.js SOC Dashboard)
       ↓
Express.js REST API (/api/v1/)
       ↓
Service Layer (Auth, Audit, Graph Engine, Detection Engine, Response Simulation)
       ↓
Repository Layer (Prisma ORM Data Access)
       ↓
PostgreSQL / SQLite Database
```

---

## 🛠️ Technology Stack

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS (Dark SOC Theme), Recharts, Lucide Icons
- **Backend:** Node.js 20+, Express.js, TypeScript, Prisma ORM, Argon2 (`hash-wasm`), PyJWT / JWT, Zod
- **Database:** PostgreSQL (with SQLite for rapid lab deployment)
- **Testing:** Jest, Supertest, Playwright
- **API Specs:** Swagger OpenAPI UI (`/docs` & `/api/v1/docs`)

---

## 🚀 Quickstart Guide

### 1. Backend Setup & Test Suite
```bash
cd backend

# Install dependencies
npm install

# Push database schema & seed initial data
npx prisma db push
npx prisma db seed

# Run full Jest & Supertest test suite (11 test suites, 61 tests passing 100%)
npm test

# Start development server
npm run dev
```
Backend API will run at `http://localhost:8000` with Swagger UI at `http://localhost:8000/docs`.

### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```
Frontend SOC Dashboard will run at `http://localhost:3000`.

---

## 🔐 Built-in Security Controls

1. **Argon2 Password Hashing:** Memory-hard hashing using `hash-wasm`.
2. **RBAC & Permissions:** Fine-grained authorization (ADMIN, SECURITY_ANALYST, VIEWER).
3. **Deception Credential Safety:** Plaintext passwords in honeypots are SHA-256 redacted before DB entry.
4. **Controlled Response Safety:** All incident containment actions operate strictly in `SAFE_SIMULATION` mode requiring explicit analyst confirmation.
5. **Graph Reachability Disambiguation:** Clear distinction between *Potential Attack Path* (graph topology) and *Observed Attack Activity* (alerts).

---

## 📚 Architectural & Module Documentation

Detailed technical guides available in `docs/`:
- [System Architecture](docs/architecture.md)
- [API Reference](docs/api.md)
- [Security & Safety Controls](docs/security.md)
- [Deployment & Operations](docs/deployment.md)
- [End-to-End SOC Demo Scenario](docs/demo-scenario.md)
- [Module Technical Documentation](docs/modules/)
