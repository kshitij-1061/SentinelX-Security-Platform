# API Reference Documentation

## Base URL
`/api/v1`

Swagger UI interactive docs: `http://localhost:8000/docs`

## Endpoints Overview

### Authentication & Users
- `POST /api/v1/auth/register` - Register user with Argon2 password
- `POST /api/v1/auth/login` - Authenticate credentials & return JWT
- `GET /api/v1/auth/me` - Current authenticated user profile
- `GET /api/v1/users` - Admin user management list

### Assets & Inventory
- `GET /api/v1/assets` - List assets with pagination & filters
- `POST /api/v1/assets` - Create asset
- `POST /api/v1/assets/discover` - Trigger controlled lab discovery probe

### Vulnerabilities
- `GET /api/v1/vulnerabilities` - List vulnerabilities & CVSS risk scores
- `POST /api/v1/vulnerabilities` - Register vulnerability
- `POST /api/v1/vulnerabilities/link-asset` - Link vulnerability to asset with exposure factor

### Threat & Detection
- `POST /api/v1/events` - Ingest & normalize raw security telemetry
- `GET /api/v1/alerts` - List generated detection alerts
- `GET /api/v1/detection-rules` - List active Sigma/Suricata detection rules

### Honeypots & Deception
- `GET /api/v1/honeypots` - List active deception traps
- `POST /api/v1/honeypot-events` - Ingest trapped honeypot event (redacts plaintext passwords)

### Correlation & Threat Intel
- `POST /api/v1/correlations/run` - Trigger alert correlation engine
- `GET /api/v1/threat-intelligence/enrich` - Enrich IOC with reputation data
- `GET /api/v1/techniques` - List MITRE ATT&CK techniques

### Attack Paths & Graph
- `POST /api/v1/attack-paths/analyze` - Trigger GraphAnalyzer topology calculation
- `GET /api/v1/attack-paths` - List computed attack paths & risk factor breakdown

### Incident Investigation & Response
- `POST /api/v1/incidents` - Open new security incident case
- `GET /api/v1/incidents/:id/timeline` - Reconstruct chronological attack timeline
- `POST /api/v1/incidents/:id/notes` - Add analyst investigation note
- `POST /api/v1/incidents/:id/evidence` - Attach evidence artifact
- `POST /api/v1/incidents/:id/actions` - Execute controlled response action (SAFE_SIMULATION)

### Dashboard & Global Search
- `GET /api/v1/dashboard/summary` - Unified SOC summary metrics
- `GET /api/v1/dashboard/analytics` - Trend & severity telemetry analytics
- `GET /api/v1/search?q=...` - Global SOC search across assets, CVEs, alerts, and incidents
