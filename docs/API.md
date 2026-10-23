# FoodLoop AI — REST API Documentation

Base URL: `http://localhost:4000/api/v1`

All responses are formatted in JSON. Protected endpoints require the `Authorization: Bearer <token>` header. For local evaluation without a live Supabase instance, mock bearer tokens are supported:
- `Bearer demo-token-household`
- `Bearer demo-token-donor`
- `Bearer demo-token-ngo`
- `Bearer demo-token-admin`

---

## 1. Authentication Endpoints

### `GET /auth/me`
Retrieves the profile and role of the currently authenticated user.

- **Auth Required**: Yes (Any valid role)
- **Response 200 OK**:
  ```json
  {
    "success": true,
    "data": {
      "id": "11111111-1111-1111-1111-111111111111",
      "email": "household@foodloop.ai",
      "full_name": "Aarav Sharma",
      "role": "household",
      "preferred_language": "en"
    }
  }
  ```

---

## 2. FreshTrack: Inventory Endpoints

### `GET /inventory`
Lists all inventory items belonging to the authenticated household user.
- **Auth Required**: Yes (`household`, `admin`)
- **Query Parameters**:
  - `status`: Optional filter (`fresh`, `expiring_soon`, `expired`, `consumed`, `wasted`)
  - `storage`: Optional filter (`fridge`, `pantry`, `freezer`)
- **Response 200 OK**:
  ```json
  {
    "success": true,
    "count": 5,
    "data": [
      {
        "id": "f1111111-1111-1111-1111-111111111111",
        "name": "Organic Whole Milk",
        "category": "Dairy",
        "quantity": 1.0,
        "unit": "liters",
        "storage": "fridge",
        "purchase_date": "2026-10-20",
        "expiry_date": "2026-10-25",
        "date_label": "use_by",
        "safety_guidance": "Must be consumed by expiry date or boiled. Keep below 4°C.",
        "status": "expiring_soon",
        "is_opened": true
      }
    ]
  }
  ```

### `POST /inventory`
Creates a new inventory item.
- **Auth Required**: Yes (`household`, `admin`)
- **Request Body**:
  ```json
  {
    "name": "Fresh Strawberries",
    "category": "Produce",
    "quantity": 500,
    "unit": "grams",
    "storage": "fridge",
    "purchase_date": "2026-10-23",
    "expiry_date": "2026-10-27",
    "date_label": "use_by",
    "safety_guidance": "Check for softening and store unwashed.",
    "is_opened": false,
    "notes": "Bought from farmer market"
  }
  ```
- **Response 201 Created**

### `PUT /inventory/:id`
Updates fields of an existing inventory item.
- **Auth Required**: Yes (Item owner or admin)
- **Response 200 OK**

### `DELETE /inventory/:id`
Deletes an inventory item.
- **Auth Required**: Yes (Item owner or admin)
- **Response 200 OK**

### `PATCH /inventory/:id/status`
Quick-updates the consumption or waste status of an item.
- **Auth Required**: Yes (Item owner or admin)
- **Request Body**:
  ```json
  {
    "status": "consumed"
  }
  ```
- **Response 200 OK**

### `POST /inventory/receipt-scan`
Extracts line items, quantities, and dates from a grocery receipt image or OCR text.
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "rawText": "STORE: FRESH MART\nORGANIC MILK 1L - 25/10/2026\nWHOLE WHEAT BREAD - 28/10/2026\nAPPLES 1KG - 02/11/2026"
  }
  ```
- **Response 200 OK**: Array of parsed draft inventory items ready for user review.

---

## 3. FoodLabel AI Endpoints

### `POST /food-labels/scan`
Parses nutrition labels, extracts text, identifies allergens, calculates Nutri-Score, and returns bilingual English/Hindi safety explanations.
- **Auth Required**: Optional (Supports public/demo scanning)
- **Request Body**:
  ```json
  {
    "product_name": "Crunchy Honey Granola",
    "raw_text": "Ingredients: Rolled oats, sugar, honey, almonds, peanuts, salt. Contains: Peanuts, Tree Nuts.",
    "user_allergens": ["peanuts", "gluten"]
  }
  ```
- **Response 200 OK**:
  ```json
  {
    "success": true,
    "data": {
      "product_name": "Crunchy Honey Granola",
      "ingredients": ["Rolled oats", "sugar", "honey", "almonds", "peanuts", "salt"],
      "detected_allergens": ["peanuts", "tree_nuts"],
      "user_allergen_alert": true,
      "conflicting_allergens": ["peanuts"],
      "health_score": 62,
      "nutri_grade": "C",
      "explanation_en": "Contains healthy oat fibers, but elevated sugars. Warning: Contains peanuts matching your allergy.",
      "explanation_hi": "इसमें स्वास्थ्यवर्धक ओट्स हैं, लेकिन चीनी अधिक है। चेतावनी: इसमें आपकी एलर्जी के अनुसार मूंगफली है।"
    }
  }
  ```

### `GET /food-labels/history`
Returns recent food label scans.
- **Auth Required**: Optional
- **Response 200 OK**

---

## 4. FoodBridge: Surplus Food Donation Endpoints

### `GET /donations`
Returns available or matched food surplus listings.
- **Query Parameters**:
  - `status`: Filter by status (`available`, `matched`, `in_transit`, etc.)
  - `food_category`: Filter by category (`cooked`, `packaged`, `bakery`, `produce`)
- **Response 200 OK**

### `POST /donations`
Registers a new surplus food donation.
- **Auth Required**: Yes (`donor`, `admin`)
- **Request Body**:
  ```json
  {
    "title": "Fresh Whole Wheat Croissants & Loaves",
    "food_category": "bakery",
    "quantity_kg": 18.5,
    "servings_estimate": 60,
    "perishable": true,
    "expiry_time": "2026-10-24T18:00:00Z",
    "pickup_address": "GreenBites Cafe, Vashi, Navi Mumbai",
    "pickup_latitude": 19.0760,
    "pickup_longitude": 72.8777,
    "pickup_window_start": "2026-10-23T14:00:00Z",
    "pickup_window_end": "2026-10-23T17:00:00Z",
    "dietary_attributes": ["vegetarian"],
    "packaging_notes": "Sealed in clean food boxes"
  }
  ```
- **Response 201 Created** (generates and secures `pickup_otp` and `delivery_otp`).

### `GET /donations/:id`
Retrieves detailed information for a specific donation.

### `POST /donations/:id/requests`
Submits a formal request from an NGO to claim an available surplus donation.
- **Auth Required**: Yes (`ngo`, `admin`)
- **Request Body**:
  ```json
  {
    "ngo_id": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    "request_notes": "Volunteer vehicle ready with cooling box."
  }
  ```
- **Response 201 Created**

### `POST /donation-requests/:id/accept`
Accepts a request and binds the donation to the chosen NGO.
- **Auth Required**: Yes (Donation owner or admin)
- **Response 200 OK** (Status moves to `matched`)

### `POST /donation-requests/:id/reject`
Declines an NGO request.
- **Auth Required**: Yes (Donation owner or admin)
- **Response 200 OK**

### `POST /donations/:id/pickup-confirmation`
Verifies physical handover of food to the NGO driver using the secret 6-digit OTP.
- **Auth Required**: Yes (`donor`, `ngo`, `admin`)
- **Request Body**:
  ```json
  {
    "otp": "482910",
    "temperature_celsius": 18.5,
    "notes": "Verified food packaging intact"
  }
  ```
- **Response 200 OK** (Status transitions to `in_transit`)

### `POST /donations/:id/delivery-confirmation`
Verifies final receipt and delivery to beneficiary shelter using the delivery OTP.
- **Auth Required**: Yes (`ngo`, `admin`)
- **Request Body**:
  ```json
  {
    "otp": "910283",
    "beneficiaries_served": 60,
    "confirmation_notes": "Distributed to community center families"
  }
  ```
- **Response 200 OK** (Status transitions to `delivered`)

---

## 5. Matching & Logistics

### `GET /matching/recommendations`
Calculates rule-based recommendations for NGOs based on proximity, capacity, and dietary preferences.
- **Auth Required**: Yes (`ngo`, `admin`)
- **Response 200 OK**: Ranked list with numerical `match_score` (0–100) and rationale breakdown.

---

## 6. Notifications & Analytics

### `GET /notifications`
Returns notifications for the current user.

### `PATCH /notifications/:id/read`
Marks a notification as read.

### `GET /analytics`
Retrieves global platform impact metrics:
- Total meals rescued
- Kilograms of food diverted from landfills
- Estimated kg CO2 emissions prevented
- Active donations and NGO count

---

## 7. Admin & Moderation

### `GET /admin/organizations`
Lists all registered donor and NGO organizations with verification status.

### `PATCH /admin/organizations/:id/verify`
Updates verification status (`verified` or `rejected`).

### `GET /admin/moderation`
Returns platform audit logs and flagged items.
