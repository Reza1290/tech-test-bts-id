# BTS.id Backend Developer Coding Test - REST API

[![Tests](https://img.shields.io/badge/Tests-55%20Passed-brightgreen.svg)]()
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.0.3-blue.svg)](http://localhost:5000/api/docs)
[![Architecture](https://img.shields.io/badge/Architecture-Clean%20%2F%20Modular%20Monolith-orange.svg)]()
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)]()

Production-grade, modular REST API developed for the **BTS.id Backend Developer Recruitment Test**, implementing Product Management and Authentication with Clean Architecture, JWT Authentication, OpenAPI / Swagger documentation, rate limiting, and in-memory caching.

---

## Table of Contents

- [Architectural Overview](#architectural-overview)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Features & Implementation Details](#features--implementation-details)
- [API Reference & Endpoints](#api-reference--endpoints)
- [Interactive OpenAPI / Swagger Documentation](#interactive-openapi--swagger-documentation)
- [Running the Application](#running-the-application)
  - [Option A: Running with Docker Compose (Recommended)](#option-a-running-with-docker-compose-recommended)
  - [Option B: Running Locally (Node.js)](#option-b-running-locally-nodejs)
- [Database Migrations (Panduan Migrasi Database)](#database-migrations-panduan-migrasi-database)
- [Automated Testing](#automated-testing)
- [cURL Request Examples](#curl-request-examples)
- [Postman Collection](#postman-collection)

---

## Architectural Overview

The application follows **Clean Architecture (Hexagonal Architecture)** divided into a **Modular Monolith**:

```
apps/backend/src/
├── core/                       # Shared Cross-Cutting Concerns
│   ├── cache/                  # In-Memory Cache Service with TTL & Invalidation
│   ├── config/                 # Typed Environment Configuration (Zod)
│   ├── database/               # MySQL Connection Pool & Health Check
│   ├── errors/                 # Standardized AppError Hierarchy (400, 401, 404, 409, 429)
│   ├── logger/                 # Pino High-Performance JSON Logger
│   ├── middleware/             # Auth, Rate-Limit, Error-Handler, Request-Logger, Validate
│   └── types/                  # Express Request & User Typings
├── docs/                       # OpenAPI 3.0.3 Specification & Swagger UI
└── modules/
    ├── auth/                   # Authentication Module
    │   ├── domain/             # User Entities & Repository Interfaces
    │   ├── application/        # Register & Login Use Cases, DTOs
    │   └── infrastructure/     # Controllers, Routes, Zod Schemas, MySQL Repo, Bcrypt, JWT
    └── products/               # Product Management Module
        ├── domain/             # Product Entity & Repository Interfaces
        ├── application/        # CRUD Use Cases, Pagination, Cache Invalidation
        └── infrastructure/     # Controllers, Routes, Zod Schemas, MySQL Repo
```

### Architectural Principles:
1. **Dependency Rule**: Inner layers (Domain) do not know about outer layers (Express, MySQL, HTTP).
2. **Domain-Driven Design (DDD)**: Rich Domain Entities & Interfaces.
3. **Single Responsibility**: Every Use Case handles a single business operation.
4. **Resilience & DevSecOps**: Rate limiting, Helmet security headers, CORS enabled for all origins, and centralized error handling.

---

## Tech Stack

- **Runtime**: Node.js v20+ / TypeScript 5.7 (ES2022 / Node16 module resolution)
- **Framework**: Express 4.21
- **Database**: MySQL 8.0 (InnoDB, JSON support, connection pooling via `mysql2`)
- **Validation**: Zod 3.24
- **Security**: JWT (`jsonwebtoken`), Bcrypt (`bcryptjs`), Helmet, CORS, Express-Rate-Limit
- **Documentation**: OpenAPI 3.0.3, Swagger UI (`swagger-ui-express`), Postman Collection
- **Testing**: Vitest 5, Supertest
- **Containerization**: Docker multi-stage build & Docker Compose with Nginx reverse proxy

---

## Features & Implementation Details

### 1. Authentication Module (`/api/auth`)
- **`POST /api/auth/register`**: Registers a new user. Validates that `password_confirmation` matches `password`. Hashes password with bcrypt (salt rounds 10). Rate-limited to **max 3 requests per 60 seconds**.
- **`POST /api/auth/login`**: Authenticates user credentials. Returns both **`authentication_token`** (access token) and **`refresh_token`** as specified in the test requirements. Rate-limited to **max 3 requests per 60 seconds**.
- **`GET /api/auth/me`**: Protected profile endpoint verifying the Bearer token.

### 2. Product Management Module (`/api/products`)
- **`GET /api/products`**:
  - Filterable by `?search=keyword` (searches `title` case-insensitively).
  - Filterable by `?category=Clothes`.
  - Pagination via `?limit=10&page=2` (returns pagination metadata).
  - **In-memory Basic Caching**: Automatically caches queries with TTL. Emits `X-Cache: HIT` or `X-Cache: MISS` HTTP response header.
- **`GET /api/products/:id`**:
  - Returns detail of a single product.
  - Returns **404 Not Found** with standard JSON error message if product does not exist.
  - Cached in-memory with `X-Cache` header.
- **`POST /api/products`**:
  - Adds a new product.
  - Requires valid **JWT Authorization** (`Authorization: Bearer <token>`).
  - Mandatory validations: `title`, `price` (>= 0), `category`, and `images` (minimum 1 valid URL).
  - Returns **400 Bad Request** with clear error message if validation fails.
  - Automatically records audit fields (`created_by`, `created_by_id`, `updated_by`, `updated_by_id`) from authenticated user.
  - Rate limited to **max 1 hit per 5 seconds**.
  - **Cache Invalidation**: Automatically clears product list and item caches upon creation.
- **`PUT /api/products/:id`**:
  - Edits product data by ID.
  - Requires valid **JWT Authorization**.
  - Returns **404 Not Found** if product does not exist.
  - Rate limited to **max 1 hit per 5 seconds**.
  - Automatically updates `updated_by`, `updated_by_id`, and `updated_at`.
  - Invalidate cache pattern upon update.
- **`DELETE /api/products/:id`**:
  - Deletes product by ID.
  - Requires valid **JWT Authorization**.
  - Returns **404 Not Found** if product does not exist.
  - Rate limited to **max 1 hit per 5 seconds**.
  - Invalidate cache pattern upon deletion.

### 3. Cross-Domain Access (CORS)
- CORS middleware is configured to accept requests from all origins (`CORS_ORIGIN=*`) with full support for GET, POST, PUT, DELETE, OPTIONS, and PATCH methods.

---

## API Reference & Endpoints

| Method | Endpoint | Auth | Rate Limit | Description |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | No | 3 req / 60s | Register new user account |
| `POST` | `/api/auth/login` | No | 3 req / 60s | Login & obtain tokens (`authentication_token`, `refresh_token`) |
| `GET` | `/api/auth/me` | Bearer | Standard | Get authenticated user info |
| `GET` | `/api/products` | No | Standard | List products (search, category, page, limit, cache) |
| `GET` | `/api/products/:id` | No | Standard | Get product detail by ID (cache, 404 if not found) |
| `POST` | `/api/products` | Bearer | 1 req / 5s | Create new product (validates fields, clears cache) |
| `PUT` | `/api/products/:id` | Bearer | 1 req / 5s | Update product by ID (clears cache, 404 if not found) |
| `DELETE` | `/api/products/:id` | Bearer | 1 req / 5s | Delete product by ID (clears cache, 404 if not found) |
| `GET` | `/health` | No | None | Liveness health check |
| `GET` | `/health/ready` | No | None | Readiness health check (database ping) |
| `GET` | `/api/docs` | No | None | Interactive Swagger UI documentation |
| `GET` | `/api/docs/openapi.json` | No | None | Raw OpenAPI 3.0 JSON specification |

---

## Interactive OpenAPI / Swagger Documentation

When the application is running, open the interactive Swagger UI in your browser:

- **Swagger UI**: [http://localhost:5000/api/docs](http://localhost:5000/api/docs) (or via Nginx: [http://localhost:80/api/docs](http://localhost:80/api/docs))
- **OpenAPI 3.0 JSON**: [http://localhost:5000/api/docs/openapi.json](http://localhost:5000/api/docs/openapi.json)

---

## Running the Application

### Option A: Running with Docker Compose (Recommended)

1. Clone the repository:
   ```bash
   git clone git@github.com:Reza1290/tech-test-bts-id.git
   cd tech-test-bts-id
   ```

2. Start all services (MySQL 8.0, Backend API, and Nginx reverse proxy):
   ```bash
   docker compose up --build -d
   ```

3. Check container status:
   ```bash
   docker compose ps
   ```

4. View logs:
   ```bash
   docker compose logs -f backend
   ```

5. The API is now live at:
   - Direct: `http://localhost:5000`
   - Nginx: `http://localhost:80`
   - Swagger UI: `http://localhost:5000/api/docs`

6. Stop containers:
   ```bash
   docker compose down -v
   ```

---

### Option B: Running Locally (Node.js)

1. Ensure MySQL is running on `localhost:3306` with credentials matching `.env` (or run `docker compose up -d mysql`).

2. Install dependencies:
   ```bash
   cd apps/backend
   npm install
   ```

3. Copy environment configuration:
   ```bash
   cp .env.example .env
   ```

4. Run database migrations:
   ```bash
   npm run migrate
   ```

5. Start development server with live reload:
   ```bash
   npm run dev
   ```

6. Build and run production build:
   ```bash
   npm run build
   npm start
   ```

---

## Database Migrations (Panduan Migrasi Database)

File migrasi database tersimpan rapi dan terorganisir di direktori:
[`infra/database/migrations/`](infra/database/migrations/)

```
infra/database/migrations/
├── 001_create_users_table.sql      # Membuat tabel 'users' untuk autentikasi & JWT
├── 002_create_products_table.sql   # Membuat tabel 'products' sesuai spesifikasi PDF
└── 003_seed_initial_data.sql       # Mengisi user default (jhon_doe) dan sample produk
```

### Cara Menjalankan Migrasi Database

Tersedia beberapa cara untuk menjalankan migrasi database:

#### 1. Menggunakan NPM Migration Runner (Direkomendasikan untuk Local Dev)
Backend dilengkapi dengan migration runner otomatis yang mengeksekusi semua file SQL migrasi secara berurutan dan mencatat riwayat migrasi pada tabel `schema_migrations`.

Runner ini bersifat **idempoten** (aman dijalankan berulang kali tanpa risiko duplikasi data atau error tabel sudah ada):

```bash
cd apps/backend
npm run migrate
```

Contoh output:
```text
[INFO]: Running database migrations from directory: D:\Workspace\test-btsid\infra\database\migrations
[INFO]: Applying migration: 001_create_users_table.sql
[INFO]: Migration applied successfully: 001_create_users_table.sql
[INFO]: Applying migration: 002_create_products_table.sql
[INFO]: Migration applied successfully: 002_create_products_table.sql
[INFO]: Applying migration: 003_seed_initial_data.sql
[INFO]: Migration applied successfully: 003_seed_initial_data.sql
[INFO]: Database migrations complete (3/3 executed)
```

Jika dijalankan ulang saat database sudah termigrasi:
```text
[DEBUG]: Migration already applied, skipping: 001_create_users_table.sql
[DEBUG]: Migration already applied, skipping: 002_create_products_table.sql
[DEBUG]: Migration already applied, skipping: 003_seed_initial_data.sql
[INFO]: Database migrations complete (0 new migrations executed)
```

#### 2. Otomatis via Docker Compose
Jika menggunakan Docker Compose, container MySQL secara otomatis mengeksekusi inisialisasi schema dan data dari [`infra/database/init.sql`](infra/database/init.sql) saat container pertama kali dijalankan:

```bash
docker compose up --build -d
```
Tidak perlu menjalankan migrasi manual saat menggunakan Docker.

#### 3. Manual via MySQL CLI / Client
Anda juga dapat mengeksekusi file SQL migrasi secara manual menggunakan MySQL client:

```bash
# Menjalankan per file migrasi berurutan
mysql -h localhost -P 3306 -u bts_user -p bts_recruitment_db < infra/database/migrations/001_create_users_table.sql
mysql -h localhost -P 3306 -u bts_user -p bts_recruitment_db < infra/database/migrations/002_create_products_table.sql
mysql -h localhost -P 3306 -u bts_user -p bts_recruitment_db < infra/database/migrations/003_seed_initial_data.sql

# Atau sekaligus menggunakan init.sql
mysql -h localhost -P 3306 -u bts_user -p bts_recruitment_db < infra/database/init.sql
```

---

## Automated Testing

The project contains unit and integration tests using **Vitest** and **Supertest** covering domain logic, use cases, validation schemas, caching behavior, rate limiters, and error handling.

Run the test suite:
```bash
cd apps/backend
npm test
```

Sample output:
```
 ✓ src/core/errors/app-error.test.ts (8 tests)
 ✓ src/modules/auth/application/register.use-case.test.ts (3 tests)
 ✓ src/modules/auth/application/login.use-case.test.ts (3 tests)
 ✓ src/modules/auth/infrastructure/auth.schema.test.ts (5 tests)
 ✓ src/modules/products/infrastructure/product.schema.test.ts (8 tests)
 ✓ src/modules/products/application/get-product-by-id.use-case.test.ts (3 tests)
 ✓ src/modules/products/application/get-products.use-case.test.ts (3 tests)
 ✓ src/core/cache/cache.service.test.ts (6 tests)
 ✓ src/modules/products/application/delete-product.use-case.test.ts (2 tests)
 ✓ src/modules/products/application/create-product.use-case.test.ts (3 tests)
 ✓ src/modules/products/application/update-product.use-case.test.ts (2 tests)
 ✓ src/core/middleware/auth.middleware.test.ts (4 tests)
 ✓ src/app.test.ts (5 tests)

 Test Files  13 passed (13)
      Tests  55 passed (55)
```

---

## cURL Request Examples

### 1. Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "jhon_doe",
    "password": "supersecret",
    "password_confirmation": "supersecret"
  }'
```

### 2. Login User
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "jhon_doe",
    "password": "supersecret"
  }'
```
Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "username": "jhon_doe"
    },
    "authentication_token": "eyJhbGciOi...",
    "refresh_token": "eyJhbGciOi...",
    "token_type": "Bearer"
  }
}
```

### 3. Get All Products (Filter & Pagination)
```bash
curl -X GET "http://localhost:5000/api/products?search=T-Shirt&category=Clothes&page=1&limit=10"
```

### 4. Get Product By ID
```bash
curl -X GET http://localhost:5000/api/products/1
```

### 5. Create Product (Requires Token)
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -d '{
    "title": "Awesome T-Shirt",
    "price": 99.99,
    "description": "High-quality cotton t-shirt",
    "category": "Clothes",
    "images": ["https://placeimg.com/640/480/any"]
  }'
```

### 6. Update Product (Requires Token)
```bash
curl -X PUT http://localhost:5000/api/products/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -d '{
    "price": 109.99,
    "title": "Awesome Premium T-Shirt"
  }'
```

### 7. Delete Product (Requires Token)
```bash
curl -X DELETE http://localhost:5000/api/products/1 \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

---

## Postman Collection

A complete, pre-configured Postman Collection is included in [`docs/bts_api_collection.postman_collection.json`](docs/bts_api_collection.postman_collection.json).
Import this file directly into Postman to execute all requests with automated `authToken` environment variable saving.

---

## License

MIT
