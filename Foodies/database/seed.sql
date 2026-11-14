-- ============================================================================
-- Foodies — Realistic Indian Restaurants & Menu Seed Data (PostgreSQL)
-- 8 Restaurants, 51 Food Items across multiple categories (INR prices)
-- Execute AFTER schema.sql on database: foodies_db
-- ============================================================================

INSERT INTO restaurants (id, name, cuisine_type, description, address, rating, delivery_time_mins, delivery_fee, image_url, is_open) VALUES
(1, 'Nizam''s Biryani Darbar', 'Biryani, Mughlai', 'Slow-cooked dum biryanis layered with aged basmati rice, saffron, and aromatic whole spices.', '18 Residency Road, Ashok Nagar', 4.6, 28, 35.00, '/images/biryani.jpg', TRUE),
(2, 'Pind Balluchi Kitchen', 'North Indian, Tandoor', 'Rich tomato-butter gravies, charcoal-grilled kebabs, and crisp tandoori breads baked fresh to order.', '42 Connaught Lane, Sector 14', 4.5, 32, 40.00, '/images/north-indian.jpg', TRUE),
(3, 'Dakshin Spice Cafe', 'South Indian, Beverages', 'Crispy golden dosas, fluffy steamed idlis, and freshly brewed filter coffee served with warm sambar.', '9 Church Street, Indiranagar', 4.7, 22, 25.00, '/images/dosa.jpg', TRUE),
(4, 'OvenCraft Pizzeria', 'Pizza, Italian', 'Stone-baked hand-stretched pizzas with San Marzano style sauces, fresh mozzarella, and Indian toppings.', '105 Park Avenue, Koramangala', 4.4, 26, 30.00, '/images/pizza.jpg', TRUE),
(5, 'Bombay Burger Co.', 'Burgers, Fast Food', 'Juicy smashed patties, crisp Indian spice-crusted fillets, toasted brioche buns, and seasoned fries.', '27 Linking Road, Bandra West', 4.3, 24, 29.00, '/images/burger.jpg', TRUE),
(6, 'Himalayan Momo House', 'Momos, Tibetan, Noodles', 'Hand-folded steamed and tandoori momos paired with fiery roasted red chilli garlic chutney.', '14 Tibetan Market, Majnu Ka Tila', 4.5, 25, 25.00, '/images/momos.jpg', TRUE),
(7, 'Rajwadi Thali Courtyard', 'Thali, Rajasthani, North Indian', 'Wholesome homestyle thalis featuring seasonal sabzis, creamy dal, fragrant rice, and warm phulkas.', '64 Heritage Chowk, Civil Lines', 4.6, 35, 35.00, '/images/thali.jpg', TRUE),
(8, 'Chai & Mithai Bistro', 'Desserts, Beverages, Snacks', 'Warm traditional Indian sweets, fudgy chocolate desserts, street snacks, and freshly brewed masala chai.', '88 Market Yard, Sadar Bazaar', 4.8, 20, 20.00, '/images/gulab-jamun.jpg', TRUE);

-- Sync sequence so future inserts don't collide with explicit IDs
SELECT setval('restaurants_id_seq', (SELECT MAX(id) FROM restaurants));

-- Menu Items: Restaurant 1 (Nizam's Biryani Darbar)
INSERT INTO menu_items (restaurant_id, name, description, category, price, is_veg, is_available, image_url) VALUES
(1, 'Hyderabadi Chicken Dum Biryani', 'Long-grain basmati rice slow-cooked on dum with spiced chicken, mint, and fried onions. Served with raita.', 'Biryani', 299.00, FALSE, TRUE, '/images/biryani.jpg'),
(1, 'Subz Zafrani Veg Biryani', 'Fragrant saffron basmati rice layered with seasonal vegetables, paneer cubes, and whole spices.', 'Biryani', 239.00, TRUE, TRUE, '/images/biryani.jpg'),
(1, 'Lucknowi Mutton Dum Biryani', 'Tender marinated mutton slow-braised in aromatic yakhni stock with kewra-scented basmati rice.', 'Biryani', 369.00, FALSE, TRUE, '/images/biryani.jpg'),
(1, 'Crispy Chicken 65', 'South-style spicy tempered fried chicken bites tossed with curry leaves and green chillies.', 'Starters', 219.00, FALSE, TRUE, '/images/butter-chicken.jpg'),
(1, 'Charred Paneer Tikka Kebab', 'Soft cottage cheese marinated in hung curd and Kashmiri chilli, roasted in a clay tandoor.', 'Starters', 209.00, TRUE, TRUE, '/images/paneer-tikka.png'),
(1, 'Mirchi Ka Salan & Boondi Raita', 'Classic Hyderabadi peanut-sesame gravy paired with chilled spiced curd.', 'Sides', 79.00, TRUE, TRUE, '/images/north-indian.jpg'),
(1, 'Shahi Gulab Jamun (2 Pcs)', 'Golden khoya dumplings steeped in warm cardamom and rose syrup.', 'Desserts', 99.00, TRUE, TRUE, '/images/gulab-jamun.jpg');

-- Menu Items: Restaurant 2 (Pind Balluchi Kitchen)
INSERT INTO menu_items (restaurant_id, name, description, category, price, is_veg, is_available, image_url) VALUES
(2, 'Old Delhi Butter Chicken', 'Charcoal-grilled chicken simmered in velvety tomato, butter, and kasuri methi makhani gravy.', 'Main Course', 329.00, FALSE, TRUE, '/images/butter-chicken.jpg'),
(2, 'Paneer Butter Masala', 'Cottage cheese cubes cooked in a rich, creamy cashew-tomato gravy finished with fresh butter.', 'Main Course', 269.00, TRUE, TRUE, '/images/north-indian.jpg'),
(2, 'Slow-Simmered Dal Makhani', 'Black urad lentils simmered overnight with tomatoes, ginger, butter, and fresh cream.', 'Main Course', 229.00, TRUE, TRUE, '/images/north-indian.jpg'),
(2, 'Tandoori Paneer Tikka Platter', 'Smoky skewered paneer, bell peppers, and onions served with mint coriander chutney.', 'Starters', 249.00, TRUE, TRUE, '/images/paneer-tikka.png'),
(2, 'Amritsari Chole & Kulcha Combo', 'Tangy Punjabi chickpeas served with two buttered stuffed kulchas and pickled onions.', 'Combos', 199.00, TRUE, TRUE, '/images/thali.jpg'),
(2, 'Butter Garlic Naan (2 Pcs)', 'Fluffy tandoor-baked flatbread brushed generously with melted butter and roasted garlic.', 'Breads', 89.00, TRUE, TRUE, '/images/north-indian.jpg'),
(2, 'Patiala Mango Lassi', 'Thick, chilled Alphonso mango and yogurt smoothie topped with crushed pistachios.', 'Beverages', 109.00, TRUE, TRUE, '/images/mango-lassi.jpg');

-- Menu Items: Restaurant 3 (Dakshin Spice Cafe)
INSERT INTO menu_items (restaurant_id, name, description, category, price, is_veg, is_available, image_url) VALUES
(3, 'Mysore Ghee Roast Masala Dosa', 'Crisp fermented rice crepe smeared with red garlic chutney, roasted in pure ghee with potato masala.', 'Dosa', 159.00, TRUE, TRUE, '/images/dosa.jpg'),
(3, 'Classic Paper Masala Dosa', 'Extra-thin, golden crispy crepe stuffed with spiced turmeric potato filling, coconut chutney, and sambar.', 'Dosa', 139.00, TRUE, TRUE, '/images/dosa.jpg'),
(3, 'Malleshwaram Idli Vada Combo', 'Two pillowy steamed rice cakes and one crispy medu vada served with hot sambar and chutneys.', 'Tiffin', 119.00, TRUE, TRUE, '/images/dosa.jpg'),
(3, 'Onion Tomato Uttapam', 'Thick savory lentil-rice pancake topped with caramelized onions, tomatoes, and fresh coriander.', 'Tiffin', 149.00, TRUE, TRUE, '/images/dosa.jpg'),
(3, 'Chettinad Chicken Pepper Fry', 'Aromatic Karaikudi-style chicken tossed with freshly cracked black pepper and curry leaves.', 'Main Course', 279.00, FALSE, TRUE, '/images/butter-chicken.jpg'),
(3, 'Madras Filter Coffee', 'Traditional dark-roast South Indian chicory coffee frothed with creamy hot milk.', 'Beverages', 69.00, TRUE, TRUE, '/images/masala-chai.jpg');

-- Menu Items: Restaurant 4 (OvenCraft Pizzeria)
INSERT INTO menu_items (restaurant_id, name, description, category, price, is_veg, is_available, image_url) VALUES
(4, 'Classic Margherita Pizza', 'Stone-baked crust topped with tangy tomato passata, fresh mozzarella, and sweet basil leaves.', 'Classic Pizza', 249.00, TRUE, TRUE, '/images/pizza.jpg'),
(4, 'Tandoori Paneer Tikka Pizza', 'Smoky paneer tikka cubes, red onions, capsicum, and molten mozzarella with mint drizzle.', 'Signature Pizza', 329.00, TRUE, TRUE, '/images/pizza.jpg'),
(4, 'Peri-Peri Chicken Feast Pizza', 'Flame-roasted peri-peri chicken chunks, jalapenos, sweet corn, and extra cheddar-mozzarella blend.', 'Signature Pizza', 369.00, FALSE, TRUE, '/images/pizza.jpg'),
(4, 'Cheesy Garlic Breadsticks', 'Warm oven-baked breadsticks brushed with herb garlic butter and bubbling mozzarella.', 'Sides', 139.00, TRUE, TRUE, '/images/pizza.jpg'),
(4, 'Creamy Arrabbiata Penne', 'Penne pasta tossed in spiced herb tomato sauce with olives and parmesan shavings.', 'Pasta', 259.00, TRUE, TRUE, '/images/noodles.jpg'),
(4, 'Warm Fudge Chocolate Brownie', 'Rich dark chocolate walnut brownie served warm with drizzled chocolate ganache.', 'Desserts', 129.00, TRUE, TRUE, '/images/brownie.jpg');

-- Menu Items: Restaurant 5 (Bombay Burger Co.)
INSERT INTO menu_items (restaurant_id, name, description, category, price, is_veg, is_available, image_url) VALUES
(5, 'Crispy Aloo Tikki Crunch Burger', 'Golden spiced potato-pea patty with tangy mint mayo, crisp lettuce, and pickled onions.', 'Burgers', 129.00, TRUE, TRUE, '/images/burger.jpg'),
(5, 'Peri-Peri Paneer Royale Burger', 'Crispy panko-crusted paneer slab, melted cheddar, chipotle slaw, and toasted brioche bun.', 'Burgers', 189.00, TRUE, TRUE, '/images/burger.jpg'),
(5, 'Double Chicken Smash Burger', 'Two seared juicy chicken patties layered with double cheddar, caramelized onions, and house sauce.', 'Burgers', 229.00, FALSE, TRUE, '/images/burger.jpg'),
(5, 'Loaded Peri-Peri Masala Fries', 'Crispy skin-on fries dusted with spicy peri-peri seasoning and drizzled with cheese sauce.', 'Sides', 119.00, TRUE, TRUE, '/images/burger.jpg'),
(5, 'Crispy Chicken Popcorn', 'Bite-sized crunchy spiced chicken morsels served with smoky garlic dip.', 'Sides', 169.00, FALSE, TRUE, '/images/burger.jpg'),
(5, 'Alphonso Mango Thick Shake', 'Creamy chilled mango milkshake blended with real mango puree.', 'Beverages', 149.00, TRUE, TRUE, '/images/mango-lassi.jpg');

-- Menu Items: Restaurant 6 (Himalayan Momo House)
INSERT INTO menu_items (restaurant_id, name, description, category, price, is_veg, is_available, image_url) VALUES
(6, 'Classic Veg Steamed Momos (8 Pcs)', 'Delicate thin-wrapped dumplings stuffed with finely chopped cabbage, carrots, ginger, and spring onion.', 'Momos', 129.00, TRUE, TRUE, '/images/momos.jpg'),
(6, 'Smoky Tandoori Paneer Momos (8 Pcs)', 'Juicy paneer momos marinated in spiced curd and charred in the tandoor, topped with chaat masala.', 'Momos', 179.00, TRUE, TRUE, '/images/momos.jpg'),
(6, 'Darjeeling Chicken Steamed Momos (8 Pcs)', 'Traditional Himalayan minced chicken dumplings steamed fresh and served with fiery red chutney.', 'Momos', 159.00, FALSE, TRUE, '/images/momos.jpg'),
(6, 'Crispy Kurkure Chicken Momos (8 Pcs)', 'Crunchy golden-fried spiced chicken momos served with garlic mayo and spicy chilli sauce.', 'Momos', 189.00, FALSE, TRUE, '/images/momos.jpg'),
(6, 'Desi Street Veg Hakka Noodles', 'Wok-tossed noodles with crisp julienned bell peppers, cabbage, soy, and roasted garlic.', 'Noodles', 179.00, TRUE, TRUE, '/images/noodles.jpg'),
(6, 'Chilli Garlic Chicken Noodles', 'High-flame wok noodles tossed with tender chicken strips, crushed chillies, and spring onions.', 'Noodles', 219.00, FALSE, TRUE, '/images/noodles.jpg');

-- Menu Items: Restaurant 7 (Rajwadi Thali Courtyard)
INSERT INTO menu_items (restaurant_id, name, description, category, price, is_veg, is_available, image_url) VALUES
(7, 'Maharaja Veg Deluxe Thali', 'Paneer butter masala, dal fry, seasonal sabzi, jeera rice, 3 butter phulkas, raita, papad, and gulab jamun.', 'Thalis', 279.00, TRUE, TRUE, '/images/thali.jpg'),
(7, 'Corporate Mini Paneer Thali', 'Rich paneer curry, yellow dal tadka, steamed rice, 2 soft rotis, and crisp salad.', 'Thalis', 199.00, TRUE, TRUE, '/images/thali.jpg'),
(7, 'Shahi Non-Veg Feast Thali', 'Butter chicken, mutton masala, jeera pulao, 2 butter naans, boondi raita, and sweet.', 'Thalis', 349.00, FALSE, TRUE, '/images/thali.jpg'),
(7, 'Rajasthani Dal Baati Churma', 'Baked whole-wheat baatis soaked in desi ghee served with panchmel dal and sweet nutty churma.', 'Specials', 259.00, TRUE, TRUE, '/images/thali.jpg'),
(7, 'Paneer Tikka Starter Box', 'Char-grilled smoky cottage cheese pieces tossed with onions and chaat masala.', 'Starters', 189.00, TRUE, TRUE, '/images/paneer-tikka.png'),
(7, 'Chilled Mango Lassi Glass', 'Smooth sweet mango yogurt cooler spiced lightly with green cardamom.', 'Beverages', 99.00, TRUE, TRUE, '/images/mango-lassi.jpg');

-- Menu Items: Restaurant 8 (Chai & Mithai Bistro)
INSERT INTO menu_items (restaurant_id, name, description, category, price, is_veg, is_available, image_url) VALUES
(8, 'Warm Kesar Gulab Jamun (3 Pcs)', 'Melt-in-mouth golden milk dumplings soaked in saffron and cardamom sugar syrup.', 'Desserts', 99.00, TRUE, TRUE, '/images/gulab-jamun.jpg'),
(8, 'Fudge Walnut Chocolate Brownie', 'Warm baked dark chocolate brownie loaded with roasted walnuts and chocolate fudge.', 'Desserts', 149.00, TRUE, TRUE, '/images/brownie.jpg'),
(8, 'Punjabi Samosa Duo with Chutneys', 'Two crisp flaky pastry triangles stuffed with spiced potato-pea filling and tamarind-mint chutneys.', 'Snacks', 79.00, TRUE, TRUE, '/images/samosa.jpg'),
(8, 'Dilli Samosa Chole Chaat', 'Crushed crispy samosas topped with spiced chickpeas, whipped yogurt, tangy chutneys, and sev.', 'Snacks', 119.00, TRUE, TRUE, '/images/samosa.jpg'),
(8, 'Adrak Elaichi Masala Chai Flask', 'Freshly brewed Assam tea simmered with crushed ginger, green cardamom, and full-cream milk (serves 2).', 'Beverages', 119.00, TRUE, TRUE, '/images/masala-chai.jpg'),
(8, 'Fresh Alphonso Mango Lassi', 'Velvety sweet mango and curd blend served chilled.', 'Beverages', 109.00, TRUE, TRUE, '/images/mango-lassi.jpg'),
(8, 'Choco Chip Espresso Brownie Box', 'Two dense, gooey bakery brownies finished with flaky sea salt.', 'Desserts', 229.00, TRUE, TRUE, '/images/brownie.jpg');

