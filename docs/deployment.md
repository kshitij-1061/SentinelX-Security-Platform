# Deployment & Operations Guide

## Operational Requirements
- **Node.js:** v20.x or later
- **Database:** PostgreSQL v15+ (or SQLite `dev.db` for rapid lab deployment)
- **Containerization:** Docker & Docker Compose

## Production Environment Configuration

Create a `.env` file in `backend/`:
```env
PORT=8000
NODE_ENV=production
DATABASE_URL="postgresql://soc_user:soc_password@localhost:5432/cyber_defense_db?schema=public"
JWT_SECRET="super-secret-production-jwt-signing-key-32-bytes-min"
JWT_EXPIRES_IN="8h"
CORS_ORIGIN="http://localhost:3000"
```

## Docker Compose Deployment

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: soc_user
      POSTGRES_PASSWORD: soc_password
      POSTGRES_DB: cyber_defense_db
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://soc_user:soc_password@postgres:5432/cyber_defense_db?schema=public
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
    depends_on:
      - backend
```
