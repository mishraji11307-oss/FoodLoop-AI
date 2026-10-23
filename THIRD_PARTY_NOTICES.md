# Third-Party Software Notices and Information

This project incorporates components from various open-source packages and relies on third-party cloud/AI services. Below is an overview of the open-source software, their associated licenses, and external service designations.

---

## 1. Frontend Open-Source Dependencies

| Package | License | Copyright / Source | Description |
| :--- | :--- | :--- | :--- |
| **Next.js** | MIT | © Vercel, Inc. | React framework for web applications |
| **React & React-DOM** | MIT | © Meta Platforms, Inc. | UI component library |
| **Tailwind CSS** | MIT | © Tailwind Labs, Inc. | Utility-first CSS framework |
| **Lucide React** | ISC | © Lucide Contributors | Accessible icon set |
| **Recharts** | MIT | © Recharts Group | Composable charting library built on React components |
| **Zod** | MIT | © Colin McDonnell | TypeScript-first schema declaration and validation |
| **React Hook Form** | MIT | © Beier Luo | Flexible forms with performant validation |
| **clsx** | MIT | © Luke Edwards | Utility for constructing `className` strings conditionally |
| **tailwind-merge** | MIT | © Dany Castillo | Merge Tailwind CSS classes without style conflicts |

---

## 2. Backend Open-Source Dependencies

| Package | License | Copyright / Source | Description |
| :--- | :--- | :--- | :--- |
| **Express** | MIT | © StrongLoop, Inc. & contributors | Fast, unopinionated, minimalist web framework for Node.js |
| **@supabase/supabase-js**| MIT | © Supabase, Inc. | Supabase client for database & auth operations |
| **cors** | MIT | © Troy Goode | Node.js CORS middleware |
| **helmet** | MIT | © Evan Hahn | Secure Express apps by setting various HTTP headers |
| **morgan** | MIT | © Douglas Christopher Wilson | HTTP request logger middleware |
| **dotenv** | BSD-2-Clause | © Scott Motte | Loads environment variables from `.env` file |
| **multer** | MIT | © Hage Yaapa | Middleware for handling `multipart/form-data` |
| **Zod** | MIT | © Colin McDonnell | Request payload and query validation |
| **tsx / ts-node-dev** | MIT | © Hiroki Osame | TypeScript execution and live reload engine |
| **Jest / Supertest** | MIT | © Meta Platforms, Inc. / Visionmedia | Automated testing frameworks |

---

## 3. External Cloud & Hosted Services (Proprietary / Managed)

The following hosted services are utilized by FoodLoop AI when configured in production mode. These are **not** bundled under the MIT open-source license and are subject to their respective terms of service:

1. **Supabase (PostgreSQL & Supabase Auth)**
   - Provider: Supabase, Inc.
   - Terms: [https://supabase.com/terms](https://supabase.com/terms)
   - Scope: Hosted managed PostgreSQL database, authentication endpoints, and Row Level Security.
   - Fallback: FoodLoop AI includes a zero-dependency in-memory repository layer for local development and demonstration when cloud credentials are omitted.

2. **Google Cloud Vision / Tesseract / OCR Engine**
   - Provider: Google LLC or custom OCR provider
   - Terms: [https://cloud.google.com/terms](https://cloud.google.com/terms)
   - Scope: Optical character recognition on receipts and nutrition labels.
   - Fallback: Deterministic OCR simulation engine included out of the box.

3. **Google Maps API / OpenStreetMap**
   - Provider: Google LLC / OpenStreetMap Foundation
   - Terms: [https://cloud.google.com/maps-platform/terms](https://cloud.google.com/maps-platform/terms)
   - Scope: Geolocation coordinates, distance calculation, and routing for food pickups.

---

## 4. Notice of Non-Endorsement

Mention of third-party products, services, trademarks, or hyperlinks does not constitute an endorsement or recommendation by the FoodLoop AI maintainers. All trademarks remain the property of their respective owners.
