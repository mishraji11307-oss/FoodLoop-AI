# FoodLoop AI Database Documentation & Migration Guide

This directory contains PostgreSQL DDL migration scripts and sample seed data for **FoodLoop AI**.

---

## Directory Structure

```text
database/
├── migrations/
│   ├── 001_initial_schema.sql       # Enums, tables, relationships, and foreign keys
│   ├── 002_row_level_security.sql   # Fine-grained RLS security policies per role
│   └── 003_indexes_and_triggers.sql # Timestamp auto-updates and performance indexes
├── seed/
│   └── seed.sql                     # Realistic demo profiles, inventory, scans, and donations
└── README.md
```

---

## 1. Setting Up with Supabase

1. **Create a Supabase Project**:
   - Go to [https://supabase.com](https://supabase.com) and create a new project.
   - Obtain your **Project URL**, **Anon Key**, and **Service Role Key** from `Settings` → `API`.

2. **Execute Migrations**:
   - Open your project dashboard and navigate to the **SQL Editor**.
   - Create a new query, paste the contents of `migrations/001_initial_schema.sql`, and click **Run**.
   - Repeat the process in order for:
     1. `001_initial_schema.sql`
     2. `002_row_level_security.sql`
     3. `003_indexes_and_triggers.sql`

3. **Populate Seed Data**:
   - In the SQL Editor, paste the contents of `seed/seed.sql` and click **Run**.

---

## 2. Setting Up with Local PostgreSQL

If you prefer running a local PostgreSQL instance via Docker or native service:

```bash
# Example with psql
createdb foodloop_db

psql -d foodloop_db -f database/migrations/001_initial_schema.sql
psql -d foodloop_db -f database/migrations/002_row_level_security.sql
psql -d foodloop_db -f database/migrations/003_indexes_and_triggers.sql
psql -d foodloop_db -f database/seed/seed.sql
```

---

## 3. Zero-Configuration In-Memory Mode

FoodLoop AI includes a built-in mock database and repository layer in the backend. If you start the backend without Supabase credentials configured in `backend/.env`, the server automatically initializes with seed data in memory, allowing complete interactive testing and evaluation of all features without requiring external cloud accounts.
