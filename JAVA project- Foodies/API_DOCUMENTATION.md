# REST API Documentation — Foodies Backend

Base URL (via Vite proxy in development): `/api` (direct Spring Boot URL: `http://localhost:8080/api`).
Authentication uses `HttpSession` cookie `FOODIES_SESSION` (`HttpOnly`, `SameSite=Lax`). All frontend `fetch` requests send `credentials: 'include'`.

---

## 1. Authentication Endpoints (`/api/auth`)

### `POST /api/auth/register`
Creates a new customer account, hashes the password using BCrypt, starts an HTTP session, and returns `201 Created`.
- **Request Body:**
  ```json
  {
    "fullName": "Aarav Sharma",
    "email": "aarav@example.com",
    "phone": "9876543210",
    "password": "password123",
    "defaultAddress": "42 Residency Road, Bengaluru"
  }
  ```
- **Responses:** `201 Created` (`{ message, user }`), `400 Bad Request` (validation errors), `409 Conflict` (`EMAIL_EXISTS`).

### `POST /api/auth/login`
Verifies email and BCrypt password hash, establishes a fresh HTTP session, and returns `200 OK`.
- **Request Body:** `{ "email": "aarav@example.com", "password": "password123" }`
- **Responses:** `200 OK` (`{ message, user }`), `401 Unauthorized` (invalid credentials).

### `POST /api/auth/logout`
Invalidates the active HTTP session (`200 OK`).

### `GET /api/auth/me`
Returns the currently authenticated customer's profile (`UserResponse`, without `passwordHash`), or `401 Unauthorized` if not logged in.

---

## 2. Restaurant & Menu Endpoints (`/api`)

### `GET /api/restaurants`
Lists open restaurants sorted by rating and delivery time.
- **Query Params (optional):** `search` (matches restaurant name, cuisine, or dishes via nested `EXISTS` query), `cuisine` (e.g., `Biryani`, `Pizza`).

### `GET /api/restaurants/{id}`
Returns `{ restaurant, menuItems }` for the specified restaurant (`404 Not Found` if invalid ID).

### `GET /api/restaurants/{id}/menu`
Returns menu items for a restaurant.
- **Query Params (optional):** `vegOnly=true`, `search=...`

### `GET /api/dishes/popular`
Returns top 8 popular dishes joined with restaurant name and ETA.

### `GET /api/dishes/search?q={query}`
Searches available dishes across all open restaurants by dish name, category, or description.

---

## 3. Cart Endpoints (`/api/cart`) — Session Required

### `GET /api/cart`
Returns the authenticated customer's cart items, subtotal, delivery fee, and final total computed from live PostgreSQL prices.

### `POST /api/cart/items`
Adds a dish to the customer's cart. Enforces the **single-restaurant cart rule**.
- **Request Body:**
  ```json
  {
    "menuItemId": 1,
    "quantity": 1,
    "replaceExisting": false
  }
  ```
- **Responses:**
  - `200 OK`: Updated `CartResponse`
  - `409 Conflict` (`code: "DIFFERENT_RESTAURANT"`): Returned when adding a dish from a different restaurant while `replaceExisting` is `false`.

### `PUT /api/cart/items/{menuItemId}`
Updates item quantity (`0` deletes the row; `1–20` updates quantity) and returns updated `CartResponse`.

### `DELETE /api/cart/items/{menuItemId}`
Removes one dish from the cart (`200 OK`, updated `CartResponse`).

### `DELETE /api/cart`
Empties the customer's entire cart (`200 OK`).

---

## 4. Order & Checkout Endpoints (`/api/orders`) — Session Required

### `POST /api/orders`
Places an order inside a single PostgreSQL transaction (`@Transactional`). Server computes all totals directly from PostgreSQL `menu_items` and `restaurants`, inserts `orders`, batch-inserts `order_items`, and calls `CALL sp_record_payment_and_clear_cart(...)`.
- **Request Body:**
  ```json
  {
    "deliveryAddress": "42 Residency Road, Bengaluru",
    "contactPhone": "9876543210",
    "paymentMethod": "UPI",
    "orderNotes": "Ring the doorbell once"
  }
  ```
- **Allowed `paymentMethod` values:** `"Cash on Delivery"`, `"UPI"`, `"Card"`.
- **Responses:** `201 Created` (`OrderResponse`), `400 Bad Request` (empty cart or validation failure).

### `GET /api/orders`
Returns all previous orders for the logged-in customer (newest first), including payment status and itemized snapshots.

### `GET /api/orders/{id}`
Returns a single order belonging to the logged-in customer (`404 Not Found` if missing or owned by another user).

---

## Standard Error Response Format
```json
{
  "status": 409,
  "code": "EMAIL_EXISTS",
  "message": "An account with this email address already exists. Please log in instead."
}
```

