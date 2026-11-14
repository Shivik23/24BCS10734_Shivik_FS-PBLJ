-- ============================================================================
-- Foodies — ADBMS Demonstration & Verification Queries (PostgreSQL)
-- Covers: Joins (INNER, LEFT, Multi-table), Nested Queries, Views,
--         Stored Procedures, Triggers/Audit Logs, and Transactions (COMMIT/ROLLBACK)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. INNER JOIN: List all restaurants with their vegetarian menu items
-- ----------------------------------------------------------------------------
SELECT
    r.name AS restaurant_name,
    r.cuisine_type,
    m.name AS dish_name,
    m.category,
    m.price
FROM restaurants r
INNER JOIN menu_items m ON m.restaurant_id = r.id
WHERE m.is_veg = TRUE AND m.is_available = TRUE
ORDER BY r.name, m.category, m.price;

-- ----------------------------------------------------------------------------
-- 2. LEFT JOIN: Show all restaurants and their order count (including 0 orders)
-- ----------------------------------------------------------------------------
SELECT
    r.id,
    r.name AS restaurant_name,
    r.rating,
    COUNT(o.id) AS total_orders,
    COALESCE(SUM(o.total_amount), 0.00) AS total_revenue
FROM restaurants r
LEFT JOIN orders o ON o.restaurant_id = r.id
GROUP BY r.id, r.name, r.rating
ORDER BY total_orders DESC, r.rating DESC;

-- ----------------------------------------------------------------------------
-- 3. MULTI-TABLE JOIN: Full customer order receipt with user, restaurant,
--    items, and payment details
-- ----------------------------------------------------------------------------
SELECT
    o.id AS order_id,
    u.full_name AS customer_name,
    r.name AS restaurant_name,
    oi.item_name,
    oi.quantity,
    oi.unit_price,
    (oi.quantity * oi.unit_price) AS line_total,
    o.delivery_fee,
    o.total_amount,
    o.status AS order_status,
    p.payment_method,
    p.payment_status,
    p.transaction_ref,
    o.created_at
FROM orders o
INNER JOIN users u ON u.id = o.user_id
INNER JOIN restaurants r ON r.id = o.restaurant_id
INNER JOIN order_items oi ON oi.order_id = o.id
LEFT JOIN payments p ON p.order_id = o.id
ORDER BY o.created_at DESC, oi.id ASC;

-- ----------------------------------------------------------------------------
-- 4. NESTED QUERY (Scalar Subquery): Dishes priced above the overall menu average
-- ----------------------------------------------------------------------------
SELECT
    m.name AS dish_name,
    r.name AS restaurant_name,
    m.price,
    ROUND((SELECT AVG(price) FROM menu_items), 2) AS catalog_avg_price
FROM menu_items m
INNER JOIN restaurants r ON r.id = m.restaurant_id
WHERE m.price > (SELECT AVG(price) FROM menu_items)
ORDER BY m.price DESC;

-- ----------------------------------------------------------------------------
-- 5. NESTED QUERY (IN / EXISTS): Restaurants that serve Biryani or have items
--    under Rs. 150
-- ----------------------------------------------------------------------------
SELECT r.id, r.name, r.cuisine_type, r.rating
FROM restaurants r
WHERE EXISTS (
    SELECT 1
    FROM menu_items m
    WHERE m.restaurant_id = r.id
      AND m.is_available = TRUE
      AND (LOWER(m.name) LIKE '%biryani%' OR m.price < 150)
)
ORDER BY r.rating DESC;

-- ----------------------------------------------------------------------------
-- 6. NESTED QUERY (Correlated Subquery): Customer order spend vs their average
-- ----------------------------------------------------------------------------
SELECT
    o.id AS order_id,
    u.full_name,
    o.total_amount,
    (
        SELECT ROUND(AVG(o2.total_amount), 2)
        FROM orders o2
        WHERE o2.user_id = o.user_id
    ) AS customer_avg_order_value
FROM orders o
INNER JOIN users u ON u.id = o.user_id
ORDER BY o.created_at DESC;

-- ----------------------------------------------------------------------------
-- 7. VIEWS VERIFICATION
-- ----------------------------------------------------------------------------
SELECT * FROM vw_customer_order_summary ORDER BY created_at DESC;
SELECT * FROM vw_detailed_order_history ORDER BY ordered_at DESC;
SELECT * FROM vw_restaurant_menu_catalog LIMIT 15;

-- ----------------------------------------------------------------------------
-- 8. TRANSACTION DEMONSTRATION: SUCCESSFUL COMMIT
--    Inserts an order + order item + payment and commits permanently.
-- ----------------------------------------------------------------------------
-- BEGIN;
--     INSERT INTO orders (
--         user_id, restaurant_id, delivery_address, contact_phone,
--         payment_method, subtotal, delivery_fee, total_amount, status
--     ) VALUES (
--         1, 1, '42 MG Road, Indiranagar, Bengaluru', '9876543210',
--         'UPI', 299.00, 35.00, 334.00, 'PLACED'
--     );
--     -- Trigger trg_orders_audit_log automatically records 'PLACED' in order_audit_logs
-- COMMIT;

-- ----------------------------------------------------------------------------
-- 9. TRANSACTION DEMONSTRATION: ROLLBACK ON FAILURE
--    Shows that if a payment fails a CHECK constraint after order creation,
--    ROLLBACK undoes the entire transaction so no orphan order remains.
-- ----------------------------------------------------------------------------
-- BEGIN;
--     INSERT INTO orders (
--         user_id, restaurant_id, delivery_address, contact_phone,
--         payment_method, subtotal, delivery_fee, total_amount, status
--     ) VALUES (
--         1, 2, '42 MG Road, Indiranagar, Bengaluru', '9876543210',
--         'Card', 269.00, 40.00, 309.00, 'PLACED'
--     );
--     -- Suppose payment amount violates chk_payment_amount (amount <= 0):
--     -- INSERT INTO payments (order_id, payment_method, amount, payment_status, transaction_ref)
--     -- VALUES (currval('orders_id_seq'), 'Card', -10.00, 'FAILED', 'BAD-TXN');
-- ROLLBACK;
-- -- Confirm no orphan order or audit record was saved for the rolled-back transaction.

-- ----------------------------------------------------------------------------
-- 10. STORED PROCEDURE & TRIGGER AUDIT CHECK
-- ----------------------------------------------------------------------------
-- CALL sp_update_order_status(1, 'PREPARING');
-- SELECT * FROM order_audit_logs ORDER BY changed_at DESC;

