# FoodLoop AI Licensing & Compliance Documentation

This document describes the software licensing framework adopted by **FoodLoop AI — Track. Understand. Share.**

---

## 1. Primary License

FoodLoop AI original source code, documentation, schema migrations, and assets are licensed under the **MIT License**.

The full license text is maintained in [`LICENSE`](../LICENSE).

---

## 2. Open Source Dependency Compliance

FoodLoop AI exclusively relies on dependencies compatible with permissive open-source usage (MIT, ISC, BSD-2-Clause, Apache-2.0). 

### Key Dependency Licenses:
- **Next.js**: MIT License (Vercel, Inc.)
- **React & React DOM**: MIT License (Meta Platforms, Inc.)
- **Express**: MIT License (StrongLoop, Inc.)
- **Tailwind CSS**: MIT License (Tailwind Labs, Inc.)
- **Lucide Icons**: ISC License (Lucide Contributors)
- **Recharts**: MIT License (Recharts Group)
- **Zod**: MIT License (Colin McDonnell)
- **@supabase/supabase-js**: MIT License (Supabase, Inc.)

No GPL or AGPL copyleft viral libraries are included in runtime distributions, ensuring flexibility for both community contributions and institutional deployments.

---

## 3. Separation of Proprietary Services

FoodLoop AI is architected with a strict separation between open-source application logic and third-party SaaS services:
- **Database & Identity**: Can be operated via self-hosted PostgreSQL or Supabase cloud.
- **Vision & OCR**: Features an abstract service layer that interfaces with external APIs or uses internal simulated processing in test environments.
- **Maps & Geolocation**: Uses open mathematical Haversine algorithms for matching calculations with optional Google Maps API geocoding hooks.

Users are responsible for complying with the terms of use of any third-party APIs they configure in their `.env` files.
