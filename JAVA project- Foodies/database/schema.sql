-- ============================================================================
-- Foodies — PostgreSQL Database Schema (foodies_db)
-- Target DBMS: PostgreSQL 18 (compatible with PostgreSQL 14+)
-- Normalized to 3NF with PKs, FKs, UNIQUE, NOT NULL, CHECK constraints & indexes
-- ============================================================================

-- Note: Run `CREATE DATABASE foodies_db;` separately as a PostgreSQL superuser
-- if the database does not exist yet, then connect to `foodies_db` before
-- executing this script.

DROP TABLE IF EXISTS order_audit_logs CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS restaurants CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Customers table (No admin roles; strictly customer-facing platform)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    default_address VARCHAR(300) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_user_phone_len CHECK (char_length(trim(phone)) >= 10)
);

-- 2. Restaurants catalog
CREATE TABLE restaurants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    cuisine_type VARCHAR(120) NOT NULL,
    description VARCHAR(300) NOT NULL,
    address VARCHAR(255) NOT NULL,
    rating NUMERIC(2, 1) NOT NULL DEFAULT 4.2,
    delivery_time_mins INTEGER NOT NULL DEFAULT 30,
    delivery_fee NUMERIC(6, 2) NOT NULL DEFAULT 30.00,
    image_url VARCHAR(500) NOT NULL,
    is_open BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT chk_restaurant_rating CHECK (rating >= 1.0 AND rating <= 5.0),
    CONSTRAINT chk_restaurant_delivery_time CHECK (delivery_time_mins > 0),
    CONSTRAINT chk_restaurant_delivery_fee CHECK (delivery_fee >= 0)
);

-- 3. Menu items per restaurant
CREATE TABLE menu_items (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER NOT NULL,
    name VARCHAR(120) NOT NULL,
    description VARCHAR(255) NOT NULL,
    category VARCHAR(60) NOT NULL,
    price NUMERIC(8, 2) NOT NULL,
    is_veg BOOLEAN NOT NULL DEFAULT TRUE,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    image_url VARCHAR(500) NOT NULL,
    CONSTRAINT fk_menu_restaurant
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    CONSTRAINT chk_menu_price CHECK (price > 0)
);

-- 4. Customer shopping cart (persisted in PostgreSQL; single-restaurant rule enforced in app)
CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    menu_item_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_cart_user_menu_item UNIQUE (user_id, menu_item_id),
    CONSTRAINT chk_cart_quantity CHECK (quantity > 0),
    CONSTRAINT fk_cart_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_cart_menu_item
        FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
);

-- 5. Placed customer orders
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    restaurant_id INTEGER NOT NULL,
    delivery_address VARCHAR(300) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    payment_method VARCHAR(40) NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    delivery_fee NUMERIC(6, 2) NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PLACED',
    order_notes VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_order_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_restaurant
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
    CONSTRAINT chk_order_amounts CHECK (subtotal >= 0 AND delivery_fee >= 0 AND total_amount >= 0),
    CONSTRAINT chk_order_payment_method CHECK (payment_method IN ('Cash on Delivery', 'UPI', 'Card')),
    CONSTRAINT chk_order_status CHECK (status IN ('PLACED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'))
);

-- 6. Snapshot of ordered items & prices at checkout time (prevents historical receipt drift)
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    menu_item_id INTEGER NOT NULL,
    item_name VARCHAR(120) NOT NULL,
    unit_price NUMERIC(8, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    CONSTRAINT fk_order_item_order
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_item_menu_item
        FOREIGN KEY (menu_item_id) REFERENCES menu_items(id),
    CONSTRAINT chk_order_item_qty CHECK (quantity > 0),
    CONSTRAINT chk_order_item_price CHECK (unit_price > 0)
);

-- 7. Payment records (no sensitive card numbers/CVV stored)
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL UNIQUE,
    payment_method VARCHAR(40) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    payment_status VARCHAR(30) NOT NULL,
    transaction_ref VARCHAR(80) NOT NULL UNIQUE,
    paid_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payment_order
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT chk_payment_method CHECK (payment_method IN ('Cash on Delivery', 'UPI', 'Card')),
    CONSTRAINT chk_payment_status CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED')),
    CONSTRAINT chk_payment_amount CHECK (amount > 0)
);

-- 8. Order audit log populated automatically by PostgreSQL triggers (ADBMS feature)
CREATE TABLE order_audit_logs (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    old_status VARCHAR(30),
    new_status VARCHAR(30) NOT NULL,
    event_note VARCHAR(200) NOT NULL,
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_order
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- ============================================================================
-- Performance Indexes (ADBMS Indexing requirement)
-- ============================================================================
CREATE INDEX idx_restaurants_name ON restaurants (LOWER(name));
CREATE INDEX idx_restaurants_cuisine ON restaurants (LOWER(cuisine_type));
CREATE INDEX idx_menu_items_restaurant_id ON menu_items (restaurant_id);
CREATE INDEX idx_menu_items_name ON menu_items (LOWER(name));
CREATE INDEX idx_cart_items_user_id ON cart_items (user_id);
CREATE INDEX idx_orders_user_created ON orders (user_id, created_at DESC);
CREATE INDEX idx_order_items_order_id ON order_items (order_id);
CREATE INDEX idx_payments_order_id ON payments (order_id);
