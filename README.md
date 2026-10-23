# FoodLoop AI — Track. Understand. Share.

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Frontend](https://img.shields.io/badge/Next.js-14.2-black)](frontend/)
[![Backend](https://img.shields.io/badge/Express-TypeScript-blue)](backend/)
[![Database](https://img.shields.io/badge/PostgreSQL-Supabase-green)](database/)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen)]()
[![Tests](https://img.shields.io/badge/Tests-19%2F19%20Passing-success)]()

> **FoodLoop AI** is a complete, full-stack open-source platform uniting household food waste prevention, computer vision/OCR nutrition intelligence, and real-time commercial surplus food donation logistics.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Problem Statement & Objectives](#2-problem-statement--objectives)
3. [Key Features](#3-key-features)
   - [FreshTrack](#freshtrack-inventory--smart-expiry)
   - [FoodLabel AI](#foodlabel-ai-ocr--allergen-intelligence)
   - [FoodBridge](#foodbridge-surplus-donation--ngo-matching)
4. [Technology Stack](#4-technology-stack)
5. [Architecture Overview](#5-architecture-overview)
6. [Repository Structure](#6-repository-structure)
7. [Prerequisites & Installation](#7-prerequisites--installation)
8. [Environment Variable Configuration](#8-environment-variable-configuration)
9. [Supabase Project Setup](#9-supabase-project-setup)
10. [Database Migrations & Seed Data](#10-database-migrations--seed-data)
11. [Running the Frontend](#11-how-to-run-the-frontend)
12. [Running the Backend](#12-how-to-run-the-backend)
13. [Running Both Concurrently](#13-how-to-run-both-concurrently)
14. [API Endpoints & Documentation](#14-api-endpoints--documentation)
15. [Authentication, Roles & Security](#15-authentication-roles--security)
16. [OCR, AI & Map Service Configuration](#16-ocr-ai--map-service-configuration)
17. [Zero-Config Demo Mode](#17-zero-config-demo-mode--fallbacks)
18. [Testing, Linting & Type Checking](#18-running-tests-linting--builds)
19. [Deployment Instructions](#19-deployment-instructions)
20. [Licensing & Notices](#20-mit-license--third-party-licenses)
21. [Troubleshooting](#21-troubleshooting)
22. [Known Limitations & Future Roadmap](#22-known-limitations--future-improvements)
23. [Contribution Guidelines](#23-contribution-guidelines)

---

## 1. Project Overview

FoodLoop AI addresses global food waste ($1 trillion lost annually) and severe nutritional vulnerability by closing the loop between households, consumers, food businesses, and charitable relief organizations. 

The application operates as three synchronized modules:
- **FreshTrack**: Intelligent food inventory tracking, expiry countdowns, receipt OCR, and date-label safety guidance.
- **FoodLabel AI**: Computer vision and NLP for nutrition labels, ingredient breakdown, declared-allergen alerting, and bilingual (English/Hindi) food literacy.
- **FoodBridge**: Real-time donation logistics engine connecting restaurants, banquet halls, and bakeries with verified NGOs through rule-based matching and two-factor cryptographic OTP handovers.

---

## 2. Problem Statement & Objectives

### The Problem
1. **Household Spoilage & Label Confusion**: Up to 40% of household food waste is caused by confusing "Best Before" dates with "Use By" safety thresholds, leading consumers to prematurely discard wholesome food.
2. **Hidden Nutritional Traps & Allergens**: Consumers and allergy sufferers struggle with complex, dense ingredient declarations and cryptic E-number preservatives.
3. **Logistical Gaps in Surplus Distribution**: Commercial kitchens and events discard tonnes of edible prepared food daily because traditional matching with charities is manual, prone to phantom pickups, and lacks temperature/audit accountability.

### Project Objectives
- Enable rapid grocery receipt digitisation and proactive spoilage alerts.
- Enforce scientific distinctions between sensory quality ("Best Before") and microbiological risk ("Use By").
- Provide transparent Nutri-Score analysis and bilingual dietary explanations.
- Automate surplus food discovery using deterministic, explainable multi-criteria matching.
- Prevent lost food donations through secret 6-digit OTP verification for drivers and shelter distribution.

---

## 3. Key Features

### FreshTrack: Inventory & Smart Expiry
- **Automated Receipt Ingestion**: Paste or scan supermarket receipts; regex/OCR heuristics extract line items, storage areas, and shelf-life estimates.
- **Date Label Semantic Intelligence**: Clear operational division between `Use-By` (strict microbial deadline) and `Best-Before` (quality advisory).
- **Proactive Expiry Alerts**: Dynamic classification into `fresh`, `expiring_soon`, `expired`, and `consumed`.
- **Zero-Waste Recipe Engine**: Curates recipes tailored directly to ingredients currently nearing expiration in the user's pantry.
- **Waste vs. Consumption Analytics**: Tracks personal food waste diversion metrics.

### FoodLabel AI: OCR & Allergen Intelligence
- **Open Food Facts Live Barcode Lookup**: Direct integration with the Open Food Facts API (`/api/v2/product/{barcode}.json`) fetching verified Nutri-Score, NOVA group, Eco-Score, allergens, and nutritional metrics with multi-mirror fallback and memory caching.
- **Packaging Vision & OCR Parsing**: Ingests packaging photos or OCR text, extracting ingredients and nutritional facts (energy, protein, sugars, saturated fat, sodium).
- **Nutri-Score Calculation**: Algorithmic scoring (grades A through E) based on European dietary profiling standards.
- **Personal Allergen Alert Guard**: Detects declared allergens (Peanuts, Tree Nuts, Milk, Gluten, Soy, Shellfish, Sesame) and raises immediate alerts when matching the user's sensitivity profile.
- **Bilingual Accessibility**: Instant toggle between plain-English and plain-Hindi explanations (`हिंदी`).
- **Preservative & E-Number Index**: Detects artificial additives (e.g., E306, E211, E330).

### FoodBridge: Surplus Donation & NGO Matching
- **Commercial Donor Surplus Posting**: Bakeries, caterers, and restaurants list surplus volume (kg), estimated servings, temperature status, and pickup windows.
- **Rule-Based NGO Matching Algorithm**: Evaluates geographic proximity (Haversine formula), recipient NGO daily handling capacity, dietary compatibility, and expiration urgency to compute a transparent 0–100 match score.
- **Strict State Machine Lifecycle**:
  $$\text{available} \longrightarrow \text{requested} \longrightarrow \text{matched} \longrightarrow \text{in\_transit} \longrightarrow \text{delivered}$$
- **Two-Factor OTP Verification**:
  - *Pickup OTP*: Confirmed by driver upon physical collection from the donor.
  - *Delivery OTP*: Verified by recipient shelter upon final meal handover.
- **Audit Logging**: Every handover records temperature, beneficiary counts, and timestamps.

---

## 4. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide React, Recharts, React Hook Form, Zod |
| **Backend** | Node.js, Express, TypeScript, Zod, Helmet, Morgan, CORS, Dotenv, Supertest, Jest |
| **Database & Auth** | PostgreSQL, Supabase Auth, Row Level Security (RLS), In-Memory Mock Fallback Engine |
| **AI / Heuristics** | Deterministic OCR parsing, Nutri-Score profiling, Haversine geospatial calculations |
| **Tooling** | npm workspaces, tsx, concurrently, rimraf |

---

## 5. Architecture Overview

FoodLoop AI strictly separates the client presentation layer from server-side domain logic:

```text
                       ┌────────────────────────────────┐
                       │     Next.js Web Client         │
                       │  (React 18 / TypeScript / UI)  │
                       └───────────────┬────────────────┘
                                       │ HTTPS / JSON
                                       ▼
                       ┌────────────────────────────────┐
                       │     Express REST API Server    │
                       │  (Port 4000: Routes & Guards)  │
                       └───────────────┬────────────────┘
                                       │
     ┌───────────────────┬─────────────┴───────┬───────────────────┐
     ▼                   ▼                     ▼                   ▼
┌──────────────┐  ┌──────────────┐      ┌──────────────┐    ┌──────────────┐
│  FreshTrack  │  │ FoodLabel AI │      │  FoodBridge  │    │ Admin/Audit  │
│   Service    │  │   Service    │      │   Service    │    │   Service    │
└──────┬───────┘  └──────┬───────┘      └──────┬───────┘    └──────┬───────┘
       │                 │                     │                   │
       └─────────────────┴─────────────┬───────┴───────────────────┘
                                       ▼
                       ┌────────────────────────────────┐
                       │    Abstract Repository Layer   │
                       └───────────────┬────────────────┘
                                       │
                     ┌─────────────────┴─────────────────┐
                     ▼                                   ▼
          ┌─────────────────────┐             ┌─────────────────────┐
          │ Supabase PostgreSQL │             │  Zero-Config Mock   │
          │     (Production)    │             │ (Local Dev / Tests) │
          └─────────────────────┘             └─────────────────────┘
```

---

## 6. Repository Structure

```text
foodloop-ai/
├── frontend/
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── app/                # Next.js App Router pages
│   │   │   ├── (auth)/         # Login & Register screens
│   │   │   ├── dashboard/      # Role-adaptive unified dashboard
│   │   │   ├── freshtrack/     # Inventory, receipt OCR & recipe suggestions
│   │   │   ├── foodlabel/      # Label scanner & allergen analysis
│   │   │   ├── foodbridge/     # Surplus donation & NGO claims
│   │   │   ├── admin/          # Moderation & NGO verification
│   │   │   ├── layout.tsx      # Root layout with Navbar & Footer
│   │   │   └── page.tsx        # High-impact landing page
│   │   ├── components/         # Reusable UI components (Navbar, Modal, StatCard, Badge)
│   │   ├── lib/                # Utility helpers (cn, formatters)
│   │   ├── services/           # Typed frontend API client services
│   │   ├── styles/             # Tailwind CSS & global styles
│   │   └── types/              # Frontend TypeScript definitions
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── .env.example
│
├── backend/
│   ├── src/
│   │   ├── config/             # Environment & Supabase database initialization
│   │   ├── controllers/        # Express HTTP controllers
│   │   ├── middleware/         # Auth, Zod request validator, error handler, logger
│   │   ├── repositories/       # Dual-engine persistence (Supabase / In-Memory Mock)
│   │   ├── routes/             # Modular REST API route handlers
│   │   ├── services/           # Business logic (FreshTrack, FoodLabel, FoodBridge)
│   │   ├── types/              # Backend TypeScript definitions
│   │   ├── utils/              # Haversine distance, NutriScore, date helpers
│   │   ├── validators/         # Zod schemas for all endpoints
│   │   └── app.ts              # Express application entrypoint
│   ├── tests/                  # Automated Jest & Supertest integration tests
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── database/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql       # PostgreSQL DDL tables & enums
│   │   ├── 002_row_level_security.sql   # Fine-grained RLS security policies
│   │   └── 003_indexes_and_triggers.sql # Performance indexes & auto-timestamp triggers
│   ├── seed/
│   │   └── seed.sql                     # Rich seed data for testing
│   └── README.md
│
├── docs/
│   ├── ARCHITECTURE.md         # Comprehensive architectural diagrams & state machines
│   ├── API.md                  # REST endpoint reference & payload schemas
│   ├── DATABASE.md             # Entity relationships, schema tables & indexes
│   └── LICENSES.md             # Open source license details
│
├── scripts/
│   └── check-env.js            # Environment pre-flight health checker
├── .gitignore
├── .editorconfig
├── LICENSE                     # MIT License
├── THIRD_PARTY_NOTICES.md      # Attribution for open-source libraries & services
├── package.json                # Monorepo root workspace configuration
└── README.md                   # This document
```

---

## 7. Prerequisites & Installation

### Prerequisites
- **Node.js**: v18.0.0 or later (v20+ recommended)
- **npm**: v9.0.0 or later

### Installation

Clone the repository and install dependencies from the monorepo root:

```bash
git clone https://github.com/your-org/foodloop-ai.git
cd foodloop-ai

# Install root orchestration packages
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

---

## 8. Environment Variable Configuration

Create `.env` files in both `frontend` and `backend` using the provided templates:

### Backend Configuration (`backend/.env`)

```bash
cp backend/.env.example backend/.env
```

```env
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Supabase PostgreSQL Configuration
# (Leave blank for zero-config local demo mode with in-memory persistence)
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Optional external service credentials
OCR_API_KEY=
AI_API_KEY=
MAPS_API_KEY=
```

### Frontend Configuration (`frontend/.env.local`)

```bash
cp frontend/.env.example frontend/.env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1
```

---

## 9. Supabase Project Setup

1. Create a free account at [https://supabase.com](https://supabase.com) and create a new project.
2. In your Supabase dashboard, open **Settings** → **API**.
3. Copy the **Project URL**, **Anon Key**, and **Service Role Key** into `backend/.env` and `frontend/.env.local`.

---

## 10. Database Migrations & Seed Data

### Applying Migrations via Supabase Dashboard
1. Open your Supabase **SQL Editor**.
2. Run the SQL files located in `database/migrations/` sequentially:
   - `001_initial_schema.sql` (Creates enums and primary tables)
   - `002_row_level_security.sql` (Enables Row Level Security policies)
   - `003_indexes_and_triggers.sql` (Adds performance indexes and timestamp triggers)
3. Run `database/seed/seed.sql` to populate sample users, organizations, inventory, and surplus donations.

---

## 11. How to Run the Frontend

```bash
cd frontend
npm run dev
```

The Next.js frontend will be accessible at [http://localhost:3000](http://localhost:3000).

---

## 12. How to Run the Backend

```bash
cd backend
npm run dev
```

The Express API will be running on [http://localhost:4000](http://localhost:4000).

---

## 13. How to Run Both Concurrently

From the monorepo root directory, run:

```bash
npm run dev
```

This starts both the backend API (port 4000) and the Next.js frontend (port 3000) concurrently with colored terminal logs.

---

## 14. API Endpoints & Documentation

A full endpoint specification with schemas and status codes is in [`docs/API.md`](docs/API.md).

### Key Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/auth/me` | Fetch authenticated user profile | Yes |
| `POST`| `/api/v1/auth/login` | Authenticate user / obtain token | No |
| `GET` | `/api/v1/inventory` | List household inventory items | Yes (`household`) |
| `POST`| `/api/v1/inventory` | Create new inventory item | Yes (`household`) |
| `POST`| `/api/v1/inventory/receipt-scan` | OCR parser for grocery receipts | Yes |
| `GET` | `/api/v1/inventory/recipes` | Zero-waste recipe suggestions | Yes |
| `POST`| `/api/v1/food-labels/scan` | Analyze food packaging ingredients | Public / Demo |
| `GET` | `/api/v1/donations` | List available surplus food donations | Public |
| `POST`| `/api/v1/donations` | Create new surplus donation | Yes (`donor`) |
| `POST`| `/api/v1/donations/:id/requests`| NGO claims a surplus donation | Yes (`ngo`) |
| `POST`| `/api/v1/donations/:id/pickup-confirmation` | Verify pickup with 6-digit OTP | Yes |
| `POST`| `/api/v1/donations/:id/delivery-confirmation`| Verify delivery with OTP | Yes |
| `GET` | `/api/v1/matching/recommendations` | Calculate rule-based NGO matches | Yes (`ngo`) |
| `GET` | `/api/v1/analytics` | Platform social & environmental impact | Public |
| `GET` | `/api/v1/admin/organizations` | Moderation queue of NGOs & donors | Yes (`admin`) |

---

## 15. Authentication, Roles & Security

FoodLoop AI defines 4 distinct role permissions:
- `household`: Manages home pantry, grocery receipts, and dietary allergen preferences.
- `donor`: Commercial food businesses posting surplus food with pickup schedules.
- `ngo`: Verified hunger relief foundations claiming donations and coordinating pickups.
- `admin`: Platform governance, NGO verification, and immutable security audit stream.

### Security Highlights
- **Role Verification**: Server-side validation of JWT identity and role claims on every protected endpoint.
- **Strict OTP Protocol**: Cryptographic 6-digit numeric OTPs prevent unauthorized pickups.
- **Row Level Security (RLS)**: Enforced directly at the PostgreSQL database layer.

---

## 16. OCR, AI & Map Service Configuration

- **Receipt OCR & Label Analysis**: When external cloud vision keys (`OCR_API_KEY`) are not provided, FoodLoop AI utilizes internal regex-based heuristic parsing that extracts text, line items, and nutrition tables deterministically.
- **Geocoding & Maps**: Computes geographic distances accurately using the mathematical Haversine spherical formula without requiring paid Google Maps credits.

---

## 17. Zero-Config Demo Mode & Fallbacks

To ensure evaluators and contributors can test the platform instantly:
- If `SUPABASE_URL` is omitted, the backend automatically operates in **Demo Mode**, serving state from an in-memory repository with pre-seeded data.
- The UI includes an interactive **Persona Switcher** in the top navigation bar, allowing immediate switching between:
  - *Aarav Sharma* (Household Consumer)
  - *Chef Vikram Patel* (Commercial Donor)
  - *Priya Deshmukh* (Charity NGO)
  - *System Administrator* (Platform Admin)

---

## 18. Running Tests, Linting & Builds

### Run Backend Automated Tests
```bash
cd backend
npm test
```
*Executes all 5 test suites (15 tests) verifying auth, inventory CRUD, donation state transitions, rule-based matching, and label OCR.*

### Run Frontend Typecheck & Build
```bash
cd frontend
npm run build
```

### Pre-flight Health Check
```bash
node scripts/check-env.js
```

---

## 19. Deployment Instructions

### Frontend (Vercel)
1. Import the repository into [Vercel](https://vercel.com).
2. Set the root directory to `frontend`.
3. Add the environment variable:
   `NEXT_PUBLIC_API_BASE_URL=https://your-backend-domain.com/api/v1`

### Backend (Render / Railway / Fly.io)
1. Deploy from the `backend` folder.
2. Build Command: `npm install && npm run build`
3. Start Command: `npm start`
4. Set environment variables: `PORT=4000`, `NODE_ENV=production`, `FRONTEND_URL=https://your-frontend.vercel.app`.

---

## 20. MIT License & Third-Party Licenses

FoodLoop AI is licensed under the [MIT License](LICENSE).

Third-party dependencies and terms of service for cloud providers are documented in [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) and [`docs/LICENSES.md`](docs/LICENSES.md).

---

## 21. Troubleshooting

| Symptom | Cause | Solution |
| :--- | :--- | :--- |
| `Cannot connect to API` | Backend not running | Start backend with `cd backend && npm run dev` |
| `401 Unauthorized` | Missing auth token | Select a profile from the Persona Switcher on the navbar |
| `Invalid OTP Code` | Mismatched handover OTP | Check the 6-digit code shown on the donation card |
| `403 Forbidden on NGO claim` | NGO unverified | Switch to Admin persona and click "Verify" on the NGO |

---

## 22. Known Limitations & Future Roadmap

- **Smart Fridge IoT Integration**: Roadmap item for direct MQTT hardware telemetry.
- **Multilingual OCR Extension**: Currently optimized for English & Hindi labels; future expansions planned for Spanish, French, and Tamil.
- **Dynamic Routing**: Planned integration with open-source OSRM routing for volunteer delivery fleets.

---

## 23. Contribution Guidelines

Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add AmazingFeature'`).
4. Ensure all tests pass (`npm test --workspace=backend`).
5. Push to the branch (`git push origin feature/AmazingFeature`).
6. Open a Pull Request.
