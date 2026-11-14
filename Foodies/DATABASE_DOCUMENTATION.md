# Database Documentation — `foodies_db` (PostgreSQL)

The Foodies database (`foodies_db`) is designed in **PostgreSQL** and normalized to **Third Normal Form (3NF)**. It uses 7 core operational tables plus 1 trigger-managed audit table (`order_audit_logs`).

---

## Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    USERS ||--o{ CART_ITEMS : "holds in cart"
    USERS ||--o{ ORDERS : "places"
    RESTAURANTS ||--o{ MENU_ITEMS : "offers"
    RESTAURANTS ||--o{ ORDERS : "receives"
    MENU_ITEMS ||--o{ CART_ITEMS : "added to"
    MENU_ITEMS ||--o{ ORDER_ITEMS : "referenced by"
    ORDERS ||--|{ ORDER_ITEMS : "contains"
    ORDERS ||--|| PAYMENTS : "settled via"
    ORDERS ||--o{ ORDER_AUDIT_LOGS : "audited in"

    USERS {
        int id PK
        varchar full_name
        varchar email UK
        varchar phone
        varchar password_hash
        varchar default_address
        timestamp created_at
    }
    RESTAURANTS {
        int id PK
        varchar name
        varchar cuisine_type
        varchar description
        varchar address
        numeric rating
        int delivery_time_mins
        numeric delivery_fee
        varchar image_url
        boolean is_open
    }
    MENU_ITEMS {
        int id PK
        int restaurant_id FK
        varchar name
        varchar description
        varchar category
        numeric price
        boolean is_veg
        boolean is_available
        varchar image_url
    }
    CART_ITEMS {
        int id PK
        int user_id FK
        int menu_item_id FK
        int quantity
        timestamp created_at
    }
    ORDERS {
        int id PK
        int user_id FK
        int restaurant_id FK
        varchar delivery_address
        varchar contact_phone
        varchar payment_method
        numeric subtotal
        numeric delivery_fee
        numeric total_amount
        varchar status
        varchar order_notes
        timestamp created_at
        timestamp updated_at
    }
    ORDER_ITEMS {
        int id PK
        int order_id FK
        int menu_item_id FK
        varchar item_name
        numeric unit_price
        int quantity
    }
    PAYMENTS {
        int id PK
        int order_id FK_UK
        varchar payment_method
        numeric amount
        varchar payment_status
        varchar transaction_ref UK
        timestamp paid_at
    }
    ORDER_AUDIT_LOGS {
        int id PK
        int order_id FK
        varchar old_status
        varchar new_status
        varchar event_note
        timestamp changed_at
    }
```

---

## Table Specifications

### 1. `users`
Stores registered customer accounts. Passwords are stored exclusively as BCrypt hashes.
- **Primary Key:** `id` (`SERIAL`)
- **Unique Constraint:** `email`
- **Check Constraint:** `chk_user_phone_len` ensures `phone` has at least 10 characters.

### 2. `restaurants`
Stores partner kitchen profiles pre-populated via `database/seed.sql`.
- **Primary Key:** `id` (`SERIAL`)
- **Check Constraints:**
  - `chk_restaurant_rating`: `rating >= 1.0 AND rating <= 5.0`
  - `chk_restaurant_delivery_time`: `delivery_time_mins > 0`
  - `chk_restaurant_delivery_fee`: `delivery_fee >= 0`

### 3. `menu_items`
Stores dishes offered by each restaurant.
- **Primary Key:** `id` (`SERIAL`)
- **Foreign Key:** `restaurant_id -> restaurants(id) ON DELETE CASCADE`
- **Check Constraint:** `chk_menu_price` (`price > 0`)

### 4. `cart_items`
Persists each customer's active shopping cart in PostgreSQL.
- **Primary Key:** `id` (`SERIAL`)
- **Foreign Keys:**
  - `user_id -> users(id) ON DELETE CASCADE`
  - `menu_item_id -> menu_items(id) ON DELETE CASCADE`
- **Unique Constraint:** `uq_cart_user_menu_item (user_id, menu_item_id)` prevents duplicate rows for the same dish in a user's cart.
- **Check Constraint:** `chk_cart_quantity` (`quantity > 0`)
- **Application Rule:** `CartService` ensures all items in a customer's cart belong to a single restaurant.

### 5. `orders`
Stores placed customer orders, delivery details, and authoritative server-computed totals.
- **Primary Key:** `id` (`SERIAL`)
- **Foreign Keys:**
  - `user_id -> users(id) ON DELETE CASCADE`
  - `restaurant_id -> restaurants(id)`
- **Check Constraints:**
  - `chk_order_amounts`: `subtotal >= 0 AND delivery_fee >= 0 AND total_amount >= 0`
  - `chk_order_payment_method`: `IN ('Cash on Delivery', 'UPI', 'Card')`
  - `chk_order_status`: `IN ('PLACED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED')`

### 6. `order_items`
Stores line-item snapshots for each placed order. Capturing `item_name` and `unit_price` at checkout time guarantees historical bills remain accurate even if menu prices change later.
- **Primary Key:** `id` (`SERIAL`)
- **Foreign Keys:**
  - `order_id -> orders(id) ON DELETE CASCADE`
  - `menu_item_id -> menu_items(id)`
- **Check Constraints:** `quantity > 0`, `unit_price > 0`

### 7. `payments`
Stores simulated payment outcome records without storing sensitive card numbers or CVV codes.
- **Primary Key:** `id` (`SERIAL`)
- **Foreign Key & Unique:** `order_id -> orders(id) ON DELETE CASCADE` (`UNIQUE` enforces 1-to-1 order payment)
- **Unique Constraint:** `transaction_ref`
- **Check Constraints:** `payment_method IN ('Cash on Delivery', 'UPI', 'Card')`, `payment_status IN ('PENDING', 'PAID', 'FAILED')`, `amount > 0`

### 8. `order_audit_logs`
Maintained automatically by PostgreSQL trigger `trg_orders_audit_log` whenever an order is inserted or its status changes.
- **Primary Key:** `id` (`SERIAL`)
- **Foreign Key:** `order_id -> orders(id) ON DELETE CASCADE`

---

## Normalization Breakdown (1NF, 2NF, 3NF)

1. **First Normal Form (1NF):**
   - Every table has an atomic primary key (`id`) and single-valued columns.
   - Dishes inside an order are stored as separate rows in `order_items` rather than comma-separated strings in `orders`.
2. **Second Normal Form (2NF):**
   - Every table uses a single-column surrogate primary key (`id`), so no partial dependency on a composite key can occur.
   - Relationship tables (`cart_items`, `order_items`) store only attributes strictly specific to that relationship (such as `quantity` and checkout snapshot values).
3. **Third Normal Form (3NF):**
   - Non-key attributes depend strictly on the primary key and not on other non-key attributes.
   - Customer profile fields (`full_name`, `email`) live only in `users`, not in `orders`.
   - Restaurant fields (`name`, `address`, `cuisine_type`) live only in `restaurants`, not repeated inside `menu_items` or `orders`.
   - Payment settlement status and `transaction_ref` live in `payments` rather than creating transitive dependencies inside `orders`.
   - `order_items.item_name` and `order_items.unit_price` are intentional **point-in-time historical snapshots**, not redundant live references.

