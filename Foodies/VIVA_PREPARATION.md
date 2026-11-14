# Viva Preparation Guide — Foodies

This guide prepares every team member to clearly explain the architecture, code, and ADBMS concepts used in **Foodies**.

---

## 1. What does the project do?
Foodies is a customer-facing online food ordering web application. Customers can register and log in, search and filter restaurants, browse categorized menus with vegetarian/non-vegetarian markers, manage a database-persisted shopping cart (with a single-restaurant cart rule), place orders with Cash on Delivery / UPI / Card selection, and view past order receipts and statuses.

## 2. Why is React used?
React lets us divide the UI into clean, reusable components (`Navbar`, `RestaurantCard`, `MenuItemCard`, `CartReplaceDialog`) and manage dynamic client state (`AuthContext`, `CartContext`) without reloading the browser page. Paired with Vite, development builds and updates happen almost instantaneously.

## 3. What does Spring Boot do?
Spring Boot hosts our backend REST API on embedded Tomcat (`port 8080`). It handles HTTP routing (`@RestController`), request validation (`@Valid`), session management (`HttpSession`), password hashing (`BCryptPasswordEncoder`), database connection pooling (HikariCP), and declarative transactions (`@Transactional`).

## 4. What are REST APIs?
REST (Representational State Transfer) APIs expose resources over standard HTTP methods and JSON payloads. For example:
- `GET /api/restaurants` reads restaurants
- `POST /api/cart/items` adds a dish to the cart
- `PUT /api/cart/items/{menuItemId}` updates quantity
- `DELETE /api/cart/items/{menuItemId}` removes an item
- `POST /api/orders` places an order

## 5. What is JDBC?
JDBC (Java Database Connectivity) is the standard Java API for communicating with relational databases using SQL. Instead of hiding SQL behind an ORM like JPA/Hibernate, Foodies uses **Spring `JdbcTemplate`** and the **PostgreSQL JDBC Driver**, executing explicit parameterized SQL queries (`?` placeholders) and mapping rows using `RowMapper`.

Example from `UserRepository.java`:
```java
public Optional<User> findByEmail(String email) {
    String sql = "SELECT id, full_name, email, phone, password_hash, default_address, created_at FROM users WHERE LOWER(email) = LOWER(?)";
    List<User> results = jdbcTemplate.query(sql, USER_ROW_MAPPER, email);
    return results.stream().findFirst();
}
```

## 6. How does React communicate with Java?
In `frontend/src/services/api.js`, React calls `fetch('/api/...', { credentials: 'include' })`. During development, `vite.config.js` proxies `/api` requests to `http://localhost:8080`. Because `credentials: 'include'` is enabled, the browser sends the `FOODIES_SESSION` cookie on every request, keeping the user logged in across refreshes.

## 7. How does Java communicate with PostgreSQL?
`application.properties` configures `spring.datasource.url=jdbc:postgresql://localhost:5432/foodies_db` and `org.postgresql.Driver`. Spring Boot manages a HikariCP connection pool and passes connections to `JdbcTemplate`, which sends parameterized SQL statements to PostgreSQL over TCP port `5432`.

## 8. What does each database table store?
1. `users`: Customer details and BCrypt `password_hash`.
2. `restaurants`: Restaurant names, cuisines, ratings, delivery times, delivery fees, and images.
3. `menu_items`: Dishes linked to `restaurants`, including category, price, veg flag, and availability.
4. `cart_items`: Active shopping cart rows per `user_id` and `menu_item_id`.
5. `orders`: Placed orders with delivery address, phone, authoritative subtotal/delivery fee/total, status, and timestamps.
6. `order_items`: Immutable snapshots of dish name and unit price at checkout time.
7. `payments`: Payment method, amount, `PAID`/`PENDING` status, and unique `transaction_ref`.
8. `order_audit_logs`: Automatic audit trail populated by PostgreSQL triggers whenever an order is created or updated.

## 9. Primary and Foreign Keys
- **Primary Key (PK):** Uniquely identifies every row in a table (for example, `users.id`, `orders.id`).
- **Foreign Key (FK):** Links a child table to a parent primary key to enforce referential integrity (for example, `menu_items.restaurant_id REFERENCES restaurants(id)` and `order_items.order_id REFERENCES orders(id)`). PostgreSQL prevents inserting an order for a nonexistent user or restaurant.

## 10. Normalization
- **1NF:** Atomic columns, no comma-separated lists (ordered dishes live in `order_items`).
- **2NF:** Single-column PKs eliminate partial dependencies.
- **3NF:** Eliminates transitive dependencies by separating `users`, `restaurants`, `menu_items`, `orders`, and `payments`. `order_items.unit_price` and `item_name` are deliberate point-in-time historical snapshots.

## 11. SQL Joins
- **INNER JOIN:** Returns matching rows from both tables (used in `CartRepository.findCartDetailsByUserId` joining `cart_items`, `menu_items`, and `restaurants`).
- **LEFT JOIN:** Keeps all rows from the left table even if there is no match on the right (used in `OrderRepository.findOrdersByUserId` with `payments`, and in `example_queries.sql` to show restaurants with `0` orders).
- **Multi-table Join:** Combines 3–5 tables together to build full customer receipts.

## 12. Nested Queries
A query inside another SQL query. In `RestaurantRepository.findAll`, an `EXISTS` subquery checks `menu_items` so searching `"Biryani"` matches restaurants whose menu includes biryani dishes, even if `"Biryani"` is not in the restaurant name:
```sql
OR EXISTS (
    SELECT 1 FROM menu_items m
    WHERE m.restaurant_id = r.id
      AND m.is_available = TRUE
      AND (LOWER(m.name) LIKE ? OR LOWER(m.category) LIKE ?)
)
```

## 13. Stored Procedures
Reusable PL/pgSQL programs stored inside PostgreSQL (`database/adbms_features.sql`). Foodies implements:
- `sp_record_payment_and_clear_cart`: Inserts the payment record and clears `cart_items`, invoked directly from Java (`CALL sp_record_payment_and_clear_cart(?, ?, ?, ?, ?)`).
- `sp_place_order_from_cart`: Full SQL-side checkout procedure.
- `sp_update_order_status`: Updates status and fires audit triggers.

## 14. Triggers
Database callbacks executed automatically by PostgreSQL before or after `INSERT`/`UPDATE`:
- `trg_orders_set_updated_at`: `BEFORE UPDATE ON orders` updates `NEW.updated_at := CURRENT_TIMESTAMP`.
- `trg_orders_audit_log`: `AFTER INSERT OR UPDATE ON orders` writes a row into `order_audit_logs`.

## 15. Views
Saved virtual tables defined by `SELECT` queries (`database/adbms_features.sql`):
- `vw_customer_order_summary`
- `vw_detailed_order_history`
- `vw_restaurant_menu_catalog`
They simplify complex joins into clean single-table queries without duplicating stored data.

## 16. Indexing
Data structures that speed up search and join lookups (`database/schema.sql`):
- Case-insensitive search indexes (`LOWER(name)`, `LOWER(cuisine_type)`)
- Foreign key indexes (`menu_items(restaurant_id)`, `cart_items(user_id)`, `orders(user_id, created_at DESC)`).

## 17. Transactions
A transaction groups multiple database writes into one atomic unit (**ACID**). In `OrderService.placeOrder`, `@Transactional(rollbackFor = Exception.class)` ensures inserting `orders`, batch-inserting `order_items`, inserting `payments`, and deleting `cart_items` either **all succeed together** or **all fail together**.

## 18. COMMIT and ROLLBACK
- **COMMIT:** Permanently saves all changes inside a transaction once every step succeeds.
- **ROLLBACK:** Reverts every change made during the transaction if any SQL error, constraint check, or runtime exception occurs. For instance, if inserting into `payments` fails `CHECK (amount > 0)`, PostgreSQL rolls back the `orders` and `order_items` rows so no incomplete order or orphan audit entry remains.

## 19. How an Order Is Placed Internally (Step by Step)
1. Customer clicks **Place Order** on `CheckoutPage.jsx`, sending `POST /api/orders` with `deliveryAddress`, `contactPhone`, `paymentMethod`, and `orderNotes`.
2. `OrderController` validates the payload (`@Valid`) and extracts `userId` from `HttpSession`.
3. `OrderService.placeOrder` starts a Spring `@Transactional` PostgreSQL transaction.
4. `CartRepository` fetches cart items joined with live `menu_items` and `restaurants` prices (ignoring any client price tampering).
5. `OrderRepository.insertOrder` inserts the row into `orders` (`RETURNING id`), which fires `trg_orders_audit_log` to log `'PLACED'`.
6. `OrderRepository.insertOrderItems` batch-inserts price and dish-name snapshots into `order_items`.
7. `OrderRepository.callRecordPaymentAndClearCart` runs `CALL sp_record_payment_and_clear_cart(...)`, saving the payment record in `payments` and deleting the user's rows from `cart_items`.
8. Spring **COMMITS** the transaction, and React redirects to `/orders?placed={id}` showing the saved order from PostgreSQL.

