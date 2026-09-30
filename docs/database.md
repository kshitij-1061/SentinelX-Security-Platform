# Database Entity & Schema Documentation

## Core Phase 1 Entities

### `users` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR(36) | PRIMARY KEY, UUID | Unique user identifier |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL, INDEX | Analyst login email |
| `hashed_password` | VARCHAR(255) | NOT NULL | Bcrypt password hash |
| `full_name` | VARCHAR(255) | NOT NULL | User full name |
| `is_active` | BOOLEAN | DEFAULT true | Account status |
| `role_id` | VARCHAR(36) | FOREIGN KEY (`roles.id`) | Assigned RBAC role |
| `created_at` | DATETIME | DEFAULT now() | Account creation time |
| `updated_at` | DATETIME | DEFAULT now() | Account update time |

### `roles` & `permissions` Tables
- **`roles`**: Defines `ADMIN`, `SECURITY_ANALYST`, and `VIEWER`.
- **`permissions`**: Granular scopes (`asset:read`, `asset:write`, `vulnerability:read`, `alert:read`, `alert:investigate`, `incident:read`, `incident:manage`, `system:admin`).
- **`role_permissions`**: Many-to-many junction binding roles to permissions.

### `audit_logs` Table
- Tracks `USER_LOGIN`, `FAILED_LOGIN`, and `USER_LOGOUT` events with client IP address, User-Agent, and JSON metadata.

## Future Schema Extensions
- `assets`, `services`, `vulnerabilities`, `asset_vulnerabilities`, `raw_events`, `alerts`, `correlated_incidents`, `containment_actions`, `honeypot_interactions`.
