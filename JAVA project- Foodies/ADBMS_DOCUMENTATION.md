# ADBMS Implementation Documentation — Foodies

Every Advanced Database Management Systems (ADBMS) topic in Foodies is implemented directly in **PostgreSQL** (`database/schema.sql`, `database/adbms_features.sql`, `database/example_queries.sql`) and integrated with **Spring JDBC**.

---

## 1. Normalization (1NF, 2NF, 3NF)
- **Where implemented:** `database/schema.sql` and documented in `database/adbms_features.sql`.
- Eliminates repeating groups (`order_items` separated from `orders`), partial dependencies (single-column primary keys), and transitive dependencies (`users`, `restaurants`, and `payments` separated cleanly).

## 2. SQL Joins (`INNER JOIN`, `LEFT JOIN`, Multi-table Joins)
- **Used in live backend (`JdbcTemplate`):**
  - `RestaurantRepository.findPopularDishes` & `searchDishes`: `INNER JOIN` between `menu_items` and `restaurants`.
  - `CartRepository.findCartDetailsByUserId`: 3-table `INNER JOIN` (`cart_items` -> `menu_items` -> `restaurants`) to calculate live cart totals.
  - `OrderRepository.findOrdersByUserId`: Multi-table join combining `orders`, `restaurants` (`INNER JOIN`), and `payments` (`LEFT JOIN`).
- **Demonstrated in `database/example_queries.sql`:** Queries 1, 2, and 3 demonstrate `INNER JOIN`, `LEFT JOIN` (including restaurants with zero orders), and a 5-table receipt join.

## 3. Nested Queries (Subqueries)
- **Used in live backend:**
  - `RestaurantRepository.findAll(search, cuisine)` uses an `EXISTS (SELECT 1 FROM menu_items ...)` correlated subquery so searching `"Biryani"` or `"Dosa"` returns every restaurant serving matching dishes, even if the dish name is not in the restaurant title.
- **Demonstrated in `database/example_queries.sql`:**
  - Query 4: Scalar subquery comparing each dish's price against `(SELECT AVG(price) FROM menu_items)`.
  - Query 5: `EXISTS` subquery finding restaurants serving biryani or budget dishes under ₹150.
  - Query 6: Correlated subquery comparing each customer's order total against that customer's own average order spend.

## 4. Stored Procedures (PL/pgSQL)
Implemented in `database/adbms_features.sql`:
1. **`sp_record_payment_and_clear_cart(p_order_id, p_user_id, p_payment_method, p_amount, p_transaction_ref)`**
   - Invoked directly from Java (`OrderRepository.callRecordPaymentAndClearCart`) inside Spring's `@Transactional` checkout flow.
   - Determines `payment_status` (`PENDING` for Cash on Delivery, `PAID` for UPI/Card), inserts the row into `payments`, and deletes the customer's `cart_items` atomically.
2. **`sp_place_order_from_cart(...)`**
   - Complete PL/pgSQL checkout procedure usable directly from pgAdmin / `psql` to validate single-restaurant cart rules, compute authoritative totals, create `orders` + `order_items`, and invoke `sp_record_payment_and_clear_cart`.
3. **`sp_update_order_status(p_order_id, p_new_status)`**
   - Updates an order's lifecycle state and triggers automatic timestamp and audit logging.

## 5. Triggers (PL/pgSQL)
Implemented in `database/adbms_features.sql`:
1. **`trg_orders_set_updated_at` (`BEFORE UPDATE ON orders`):**
   - Calls `fn_update_order_timestamp()` to automatically set `NEW.updated_at := CURRENT_TIMESTAMP` whenever any order row is updated.
2. **`trg_orders_audit_log` (`AFTER INSERT OR UPDATE ON orders`):**
   - Calls `fn_log_order_audit()` to insert an immutable audit row into `order_audit_logs` on new order placement (`NULL -> PLACED`) or status transitions (`PLACED -> PREPARING`, etc.).

## 6. Views
Implemented in `database/adbms_features.sql`:
- `vw_customer_order_summary`: Aggregates total item count and joins orders, users, restaurants, and payments.
- `vw_detailed_order_history`: Receipt-level view combining orders, order items, restaurants, and payment details.
- `vw_restaurant_menu_catalog`: Filtered catalog of available dishes at open restaurants.

## 7. Indexing
Implemented in `database/schema.sql`:
- Expression indexes for case-insensitive search: `idx_restaurants_name ON restaurants (LOWER(name))`, `idx_restaurants_cuisine ON restaurants (LOWER(cuisine_type))`, `idx_menu_items_name ON menu_items (LOWER(name))`.
- Foreign key & lookup indexes: `idx_menu_items_restaurant_id`, `idx_cart_items_user_id`, `idx_orders_user_created ON orders (user_id, created_at DESC)`, `idx_order_items_order_id`, `idx_payments_order_id`.

## 8. Transactions, `COMMIT`, and `ROLLBACK`
- **Application Layer (`OrderService.placeOrder`):**
  - Annotated with `@Transactional(rollbackFor = Exception.class)`.
  - Within one database transaction, Spring JDBC:
    1. Reads authoritative `cart_items` joined with `menu_items` and `restaurants`.
    2. Inserts into `orders` (`RETURNING id`).
    3. Batch-inserts line items into `order_items`.
    4. Calls `CALL sp_record_payment_and_clear_cart(...)` to insert into `payments` and delete `cart_items`.
  - **COMMIT:** If all 4 steps succeed, Spring commits the transaction permanently.
  - **ROLLBACK:** If any SQL constraint fails (for example, invalid `payment_method`, `CHECK` failure, or runtime error) at step 3 or 4, Spring rolls back the entire transaction—preventing half-created orders, missing payment rows, or emptied carts without an order.
- **SQL Layer (`database/example_queries.sql`):** Queries 8 and 9 demonstrate manual `BEGIN; ... COMMIT;` and `BEGIN; ... ROLLBACK;` scenarios in pgAdmin.

