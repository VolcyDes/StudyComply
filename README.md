# StudyComply

SaaS platform helping international students manage travel, visa and compliance requirements.

## Stack

- Frontend: Next.js 16 (App Router)
- Backend: NestJS
- Database: PostgreSQL (Prisma)
- Auth: JWT via HttpOnly cookie
- Rate limiting: @nestjs/throttler
- Security: helmet + compression + validation pipes

---

## Local Setup

### 1️⃣ Install
npm install
npm --prefix api install
npm --prefix web install

### 2️⃣ Configure
cp api/.env.example api/.env
cp web/.env.example web/.env

### 3️⃣ Run API
npm --prefix api run start

### 4️⃣ Run Web
npm --prefix web run dev
