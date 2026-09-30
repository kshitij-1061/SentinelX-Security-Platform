# System Architecture Documentation

## Overview
The Enterprise Cyber Defense & Attack Path Intelligence Platform is built as a modular monolith adhering to clean architecture principles:

```
[Presentation Layer] - Next.js 14, Tailwind CSS, Recharts
         │
         ▼ (HTTP / REST API)
[API Layer] - Express.js Controllers, Zod Schema Validation, Middleware
         │
         ▼
[Service Layer] - DetectionEngine, GraphAnalyzer, CorrelationEngine, ThreatIntelService, IncidentService
         │
         ▼
[Repository Layer] - AssetRepository, ThreatRepository, AttackPathRepository, IncidentRepository
         │
         ▼
[Persistence Layer] - Prisma ORM, PostgreSQL / SQLite Database
```

## Modular Structure & Services

### 1. Foundation & Core Engine
- **AuthService & Argon2:** User registration, password verification, PyJWT token issuance.
- **AuditService:** Immutable security audit logging for all critical platform actions.

### 2. Asset & Vulnerability Layer
- **AssetService & Scanner:** Discovers servers, network devices, and web apps. Restricts lab probes to private RFC 1918 ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`).
- **VulnerabilityService:** Computes explainable risk scores using CVSS, exposure level, and asset criticality.

### 3. Threat Detection & Correlation
- **DetectionEngine:** Evaluates normalized event stream against Sigma & Suricata rules.
- **CorrelationEngine:** Groups related alerts by IP, session, user, and time-proximity with human-readable rationale.

### 4. Graph Topology & Response
- **AttackPathAnalyzer:** Executes BFS traversal on asset dependency graph to compute potential reachability paths and factor breakdowns.
- **SimulationResponseProvider:** Executes controlled containment actions in `SAFE_SIMULATION` mode requiring mandatory analyst confirmation.
