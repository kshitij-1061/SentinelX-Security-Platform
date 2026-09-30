# Authentication & Authorization Architecture

## Overview
The platform uses **Node.js + Express + TypeScript** with **JWT Tokens**, **Argon2 Password Hashing**, and **Zod** schema validation.

```
Client Request ──> Zod Validation ──> Express Route ──> Auth Middleware (JWT) ──> RBAC Middleware ──> Controller
```

## Security Specifications

1. **Password Hashing:**
   - Hashed using **Argon2** (via `@node-rs/argon2` prebuilt binaries).
   - Plaintext passwords are never logged or exposed in audit trails.

2. **JWT Tokens:**
   - Signed with `HS256` algorithm.
   - Contains claims: `sub` (User ID), `email`, `role`, and `permissions`.
   - Client transmits token via `Authorization: Bearer <token>` HTTP header.

3. **Role-Based Access Control (RBAC):**
   - **`ADMIN`:** Full system rights, permissions include `SYSTEM_ADMIN`, `USER_READ`, `USER_CREATE`, `USER_UPDATE`, `USER_DELETE`, `AUDIT_READ`, `SYSTEM_READ`.
   - **`SECURITY_ANALYST`:** Analyst permissions (`USER_READ`, `AUDIT_READ`, `SYSTEM_READ`).
   - **`VIEWER`:** Read-only access (`SYSTEM_READ`).

4. **Middleware Enforcement:**
   - `authenticate`: Validates JWT token signature and populates `req.user`.
   - `requirePermission("PERM_NAME")`: Enforces backend route permissions.
