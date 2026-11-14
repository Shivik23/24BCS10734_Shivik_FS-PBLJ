# Team Division & Responsibilities — Foodies

Foodies is organized across four clear engineering tracks so all four undergraduate CSE team members own concrete modules and can explain the entire flow end-to-end during evaluation and viva.

---

## 1. Naveen — React Frontend & UI/UX
- **Primary Ownership:**
  - `frontend/index.html`, `frontend/vite.config.js`
  - Plain CSS design system (`frontend/src/styles/variables.css`, `global.css`, `components.css`, `pages.css`) using the warm white, light warm grey, and rich orange palette with `Nunito Sans`.
  - Reusable components (`Navbar.jsx`, `Footer.jsx`, `RestaurantCard.jsx`, `MenuItemCard.jsx`, `CartReplaceDialog.jsx`, `ToastNotification.jsx`).
  - Customer pages (`HomePage.jsx`, `RestaurantsPage.jsx`, `RestaurantMenuPage.jsx`, `CartPage.jsx`, `CheckoutPage.jsx`, `OrdersPage.jsx`, `LoginPage.jsx`, `RegisterPage.jsx`).
- **Viva Focus:** Component hierarchy, responsive CSS Grid/Flexbox, accessible `<dialog>` single-restaurant prompt, form validation (`:user-invalid`, `autocomplete`), and `fetch()` with `credentials: 'include'`.

## 2. Dhruv Munjal — Java Spring Boot & REST APIs
- **Primary Ownership:**
  - `backend/pom.xml`, `FoodiesApplication.java`, `config/WebConfig.java`
  - Controllers (`AuthController.java`, `RestaurantController.java`, `CartController.java`, `OrderController.java`, `SessionHelper.java`)
  - DTOs & validation (`RegisterRequest`, `LoginRequest`, `CartAddRequest`, `CheckoutRequest`, `OrderResponse`, etc.)
  - Services & global error handling (`AuthService`, `RestaurantService`, `CartService`, `OrderService`, `GlobalExceptionHandler`)
- **Viva Focus:** Layered Spring Boot architecture (`Controller -> Service -> Repository`), BCrypt hashing without Spring Security filter bloat, `HttpSession` authentication, and server-side authoritative price calculation.

## 3. Shivik Mangla — System Integration, Architecture & Testing
- **Primary Ownership:**
  - Overall folder & project architecture (`backend/`, `frontend/`, `database/`), Vite `/api` proxy setup, and session state flow (`AuthContext.jsx`, `CartContext.jsx`, `ProtectedRoute.jsx`, `services/api.js`).
  - Transactional checkout flow coordination across React -> Spring Boot -> PostgreSQL.
  - Unit & end-to-end testing (`OrderAndCartServiceTest.java`, Maven build checks, Vite production build verification, and end-to-end API/UI checklist).
  - Project documentation (`README.md`, `API_DOCUMENTATION.md`, `VIVA_PREPARATION.md`).
- **Viva Focus:** How React communicates with Spring Boot through Vite proxy with `FOODIES_SESSION` cookies, single-restaurant cart conflict handling (`409 Conflict`), and how `@Transactional` coordinates JDBC and PostgreSQL stored procedures.

## 4. Vasu Jain — PostgreSQL, Database Design & ADBMS Implementation
- **Primary Ownership:**
  - Database schema & constraints (`database/schema.sql`) and realistic Indian food seed dataset (`database/seed.sql`).
  - ADBMS features (`database/adbms_features.sql`): PL/pgSQL views (`vw_customer_order_summary`, `vw_detailed_order_history`, `vw_restaurant_menu_catalog`), triggers (`trg_orders_set_updated_at`, `trg_orders_audit_log`), and stored procedures (`sp_record_payment_and_clear_cart`, `sp_place_order_from_cart`, `sp_update_order_status`).
  - SQL demonstration script (`database/example_queries.sql`) and JDBC DAOs (`UserRepository`, `RestaurantRepository`, `CartRepository`, `OrderRepository`).
  - Database documentation (`DATABASE_DOCUMENTATION.md`, `ADBMS_DOCUMENTATION.md`).
- **Viva Focus:** ER diagram & 1NF/2NF/3NF normalization, `JdbcTemplate` + `RowMapper`, `INNER JOIN` vs `LEFT JOIN`, nested `EXISTS` subqueries, expression indexes, triggers, stored procedures, and `COMMIT`/`ROLLBACK` demonstrations in pgAdmin.

