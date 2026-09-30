# Module 1: Architecture, Authentication, RBAC & Audit System

## Technical Architecture
- Node.js + Express.js + TypeScript
- Prisma ORM + PostgreSQL / SQLite
- Argon2id Password Hashing (`hash-wasm`)
- JWT Access Tokens & RBAC Middleware

## Implemented Capabilities
- User Registration & Argon2 password hashing.
- Role-Based Access Control (ADMIN, SECURITY_ANALYST, VIEWER).
- Immutable Audit Logging (`AuditLog` model).
- API Versioning under `/api/v1/`.
- Interactive Swagger OpenAPI UI (`/docs`).
