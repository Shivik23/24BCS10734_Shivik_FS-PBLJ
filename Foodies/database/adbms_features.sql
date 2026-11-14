-- ============================================================================
-- Foodies — ADBMS Features (PostgreSQL PL/pgSQL)
-- Implements: Views, Triggers, Stored Procedures, and Normalization Notes
-- Execute AFTER schema.sql and seed.sql on database: foodies_db
-- ============================================================================

-- ============================================================================
-- A. NORMALIZATION SUMMARY (1NF -> 2NF -> 3NF)
-- ============================================================================
-- 1NF: Every table has atomic columns and a primary key (SERIAL id). No repeating
--      groups or comma-separated food lists are stored inside orders.
-- 2NF: Every non-key attribute depends on the full primary key (single-column
--      surrogate PKs; junction tables cart_items and order_items store only
--      attributes specific to that (user, item) or (order, item) relationship).
-- 3NF: Transitive dependencies are eliminated:
--      * restaurants details live only in restaurants (not duplicated in menu_items
--        or orders).
--      * user profile info lives only in users.
--      * payments are separated into payments instead of stuffing payment status
--        and transaction references into orders.
--      * order_items intentionally captures unit_price and item_name as a
--        historical point-in-time snapshot so past bills remain immutable.

-- ============================================================================
-- B. VIEWS (ADBMS Requirement F)
-- ============================================================================

-- View 1: Customer Order Summary (joins orders, users, restaurants, payments, order_items)
CREATE OR REPLACE VIEW vw_customer_order_summary AS
SELECT
    o.id AS order_id,
    o.user_id,
    u.full_name AS customer_name,
    u.email AS customer_email,
    o.restaurant_id,
    r.name AS restaurant_name,
    o.subtotal,
    o.delivery_fee,
    o.total_amount,
    o.status AS order_status,
    o.payment_method,
    COALESCE(p.payment_status, 'PENDING') AS payment_status,
    p.transaction_ref,
    COALESCE(SUM(oi.quantity), 0) AS total_items,
    o.created_at,
    o.updated_at
FROM orders o
INNER JOIN users u ON u.id = o.user_id
INNER JOIN restaurants r ON r.id = o.restaurant_id
LEFT JOIN payments p ON p.order_id = o.id
LEFT JOIN order_items oi ON oi.order_id = o.id
GROUP BY
    o.id, o.user_id, u.full_name, u.email,
    o.restaurant_id, r.name, o.subtotal, o.delivery_fee,
    o.total_amount, o.status, o.payment_method,
    p.payment_status, p.transaction_ref, o.created_at, o.updated_at;

-- View 2: Detailed Order History (receipt-level view per ordered dish)
CREATE OR REPLACE VIEW vw_detailed_order_history AS
SELECT
    o.id AS order_id,
    o.user_id,
    r.name AS restaurant_name,
    o.status AS order_status,
    o.delivery_address,
    o.created_at AS ordered_at,
    oi.id AS order_item_id,
    oi.menu_item_id,
    oi.item_name,
    oi.unit_price,
    oi.quantity,
    (oi.unit_price * oi.quantity) AS line_total,
    o.total_amount AS order_total,
    p.payment_method,
    p.payment_status
FROM orders o
INNER JOIN restaurants r ON r.id = o.restaurant_id
INNER JOIN order_items oi ON oi.order_id = o.id
LEFT JOIN payments p ON p.order_id = o.id;

-- View 3: Available Restaurant Menu Catalog
CREATE OR REPLACE VIEW vw_restaurant_menu_catalog AS
SELECT
    r.id AS restaurant_id,
    r.name AS restaurant_name,
    r.cuisine_type,
    r.rating,
    r.delivery_time_mins,
    r.delivery_fee,
    m.id AS menu_item_id,
    m.name AS dish_name,
    m.category,
    m.price,
    m.is_veg,
    m.is_available
FROM restaurants r
INNER JOIN menu_items m ON m.restaurant_id = r.id
WHERE r.is_open = TRUE AND m.is_available = TRUE;

-- ============================================================================
-- C. TRIGGERS & TRIGGER FUNCTIONS (ADBMS Requirement E)
-- ============================================================================

-- Trigger 1: Automatically refresh updated_at whenever an order row changes
CREATE OR REPLACE FUNCTION fn_update_order_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_orders_set_updated_at ON orders;
CREATE TRIGGER trg_orders_set_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION fn_update_order_timestamp();

-- Trigger 2: Record an audit entry whenever an order is created or changes status
CREATE OR REPLACE FUNCTION fn_log_order_audit()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO order_audit_logs (order_id, old_status, new_status, event_note)
        VALUES (
            NEW.id,
            NULL,
            NEW.status,
            'Order #' || NEW.id || ' placed via ' || NEW.payment_method
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO order_audit_logs (order_id, old_status, new_status, event_note)
        VALUES (
            NEW.id,
            OLD.status,
            NEW.status,
            'Order status updated from ' || OLD.status || ' to ' || NEW.status
        );
        RETURN NEW;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_orders_audit_log ON orders;
CREATE TRIGGER trg_orders_audit_log
AFTER INSERT OR UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION fn_log_order_audit();

-- ============================================================================
-- D. STORED PROCEDURES (ADBMS Requirement D)
-- ============================================================================

-- Procedure 1: Called by Spring Boot during checkout inside @Transactional.
-- Records the payment row accurately and clears the customer's cart atomically.
CREATE OR REPLACE PROCEDURE sp_record_payment_and_clear_cart(
    IN p_order_id INTEGER,
    IN p_user_id INTEGER,
    IN p_payment_method VARCHAR,
    IN p_amount NUMERIC,
    IN p_transaction_ref VARCHAR
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_payment_status VARCHAR(30);
BEGIN
    IF p_payment_method = 'Cash on Delivery' THEN
        v_payment_status := 'PENDING';
    ELSE
        v_payment_status := 'PAID';
    END IF;

    INSERT INTO payments (order_id, payment_method, amount, payment_status, transaction_ref)
    VALUES (p_order_id, p_payment_method, p_amount, v_payment_status, p_transaction_ref);

    DELETE FROM cart_items WHERE user_id = p_user_id;
END;
$$;

-- Procedure 2: Full end-to-end SQL checkout procedure (can be called directly
-- in pgAdmin or psql to demonstrate stored-procedure-driven order placement).
CREATE OR REPLACE PROCEDURE sp_place_order_from_cart(
    IN p_user_id INTEGER,
    IN p_delivery_address VARCHAR,
    IN p_contact_phone VARCHAR,
    IN p_payment_method VARCHAR,
    IN p_order_notes VARCHAR,
    INOUT p_created_order_id INTEGER DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_restaurant_id INTEGER;
    v_restaurant_count INTEGER;
    v_subtotal NUMERIC(10, 2);
    v_delivery_fee NUMERIC(6, 2);
    v_total NUMERIC(10, 2);
    v_tx_ref VARCHAR(80);
BEGIN
    -- Verify cart has items from exactly one restaurant
    SELECT COUNT(DISTINCT m.restaurant_id), MIN(m.restaurant_id)
    INTO v_restaurant_count, v_restaurant_id
    FROM cart_items c
    INNER JOIN menu_items m ON m.id = c.menu_item_id
    WHERE c.user_id = p_user_id;

    IF v_restaurant_count = 0 THEN
        RAISE EXCEPTION 'Cannot place order: cart is empty for user %', p_user_id;
    END IF;

    IF v_restaurant_count > 1 THEN
        RAISE EXCEPTION 'Cannot place order: cart contains items from multiple restaurants';
    END IF;

    -- Compute subtotal strictly from authoritative menu_items.price values
    SELECT COALESCE(SUM(m.price * c.quantity), 0)
    INTO v_subtotal
    FROM cart_items c
    INNER JOIN menu_items m ON m.id = c.menu_item_id
    WHERE c.user_id = p_user_id;

    SELECT delivery_fee INTO v_delivery_fee
    FROM restaurants
    WHERE id = v_restaurant_id;

    v_total := v_subtotal + v_delivery_fee;

    INSERT INTO orders (
        user_id, restaurant_id, delivery_address, contact_phone,
        payment_method, subtotal, delivery_fee, total_amount, status, order_notes
    )
    VALUES (
        p_user_id, v_restaurant_id, p_delivery_address, p_contact_phone,
        p_payment_method, v_subtotal, v_delivery_fee, v_total, 'PLACED', p_order_notes
    )
    RETURNING id INTO p_created_order_id;

    INSERT INTO order_items (order_id, menu_item_id, item_name, unit_price, quantity)
    SELECT p_created_order_id, m.id, m.name, m.price, c.quantity
    FROM cart_items c
    INNER JOIN menu_items m ON m.id = c.menu_item_id
    WHERE c.user_id = p_user_id;

    v_tx_ref := 'FD-TXN-' || p_created_order_id || '-' || EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT;

    CALL sp_record_payment_and_clear_cart(
        p_created_order_id,
        p_user_id,
        p_payment_method,
        v_total,
        v_tx_ref
    );
END;
$$;

-- Procedure 3: Safely advance an order's lifecycle status (fires audit + timestamp triggers)
CREATE OR REPLACE PROCEDURE sp_update_order_status(
    IN p_order_id INTEGER,
    IN p_new_status VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE orders
    SET status = p_new_status
    WHERE id = p_order_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order % not found', p_order_id;
    END IF;
END;
$$;

