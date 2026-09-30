# Development & Setup Guide

## Technology Stack Summary
- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express.js, TypeScript, Prisma ORM, Argon2, JWT, Zod, Swagger UI
- **Database:** PostgreSQL (with SQLite / PostgreSQL local support)
- **Testing:** Jest, Supertest
- **Containers:** Docker, Docker Compose

## Local Setup Instructions

### 1. Backend Setup
```bash
cd backend
npm install
npx prisma db push
npx prisma db seed
npm run dev
```
- **API URL:** [http://localhost:8000/api/v1](http://localhost:8000/api/v1)
- **Swagger Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. Backend Testing
```bash
cd backend
npm test
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
- **Frontend URL:** [http://localhost:3000](http://localhost:3000)

### 4. Running via Docker Compose
```bash
docker compose up --build
```
