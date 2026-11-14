package com.foodies.repository;

import com.foodies.dto.MenuItemWithRestaurantDto;
import com.foodies.model.MenuItem;
import com.foodies.model.Restaurant;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * JDBC repository for browsing restaurants and searching food menus.
 */
@Repository
public class RestaurantRepository {

    private final JdbcTemplate jdbcTemplate;

    private static final RowMapper<Restaurant> RESTAURANT_ROW_MAPPER = (rs, rowNum) -> {
        Restaurant restaurant = new Restaurant();
        restaurant.setId(rs.getInt("id"));
        restaurant.setName(rs.getString("name"));
        restaurant.setCuisineType(rs.getString("cuisine_type"));
        restaurant.setDescription(rs.getString("description"));
        restaurant.setAddress(rs.getString("address"));
        restaurant.setRating(rs.getBigDecimal("rating"));
        restaurant.setDeliveryTimeMins(rs.getInt("delivery_time_mins"));
        restaurant.setDeliveryFee(rs.getBigDecimal("delivery_fee"));
        restaurant.setImageUrl(rs.getString("image_url"));
        restaurant.setIsOpen(rs.getBoolean("is_open"));
        return restaurant;
    };

    private static final RowMapper<MenuItem> MENU_ITEM_ROW_MAPPER = (rs, rowNum) -> {
        MenuItem item = new MenuItem();
        item.setId(rs.getInt("id"));
        item.setRestaurantId(rs.getInt("restaurant_id"));
        item.setName(rs.getString("name"));
        item.setDescription(rs.getString("description"));
        item.setCategory(rs.getString("category"));
        item.setPrice(rs.getBigDecimal("price"));
        item.setIsVeg(rs.getBoolean("is_veg"));
        item.setIsAvailable(rs.getBoolean("is_available"));
        item.setImageUrl(rs.getString("image_url"));
        return item;
    };

    private static final RowMapper<MenuItemWithRestaurantDto> MENU_WITH_RESTAURANT_MAPPER = (rs, rowNum) -> {
        MenuItemWithRestaurantDto dto = new MenuItemWithRestaurantDto();
        dto.setId(rs.getInt("id"));
        dto.setRestaurantId(rs.getInt("restaurant_id"));
        dto.setRestaurantName(rs.getString("restaurant_name"));
        dto.setDeliveryTimeMins(rs.getInt("delivery_time_mins"));
        dto.setName(rs.getString("name"));
        dto.setDescription(rs.getString("description"));
        dto.setCategory(rs.getString("category"));
        dto.setPrice(rs.getBigDecimal("price"));
        dto.setIsVeg(rs.getBoolean("is_veg"));
        dto.setIsAvailable(rs.getBoolean("is_available"));
        dto.setImageUrl(rs.getString("image_url"));
        return dto;
    };

    public RestaurantRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * Searches restaurants by name, cuisine, or matching dishes (nested subquery).
     */
    public List<Restaurant> findAll(String search, String cuisine) {
        StringBuilder sql = new StringBuilder("""
                SELECT id, name, cuisine_type, description, address, rating,
                       delivery_time_mins, delivery_fee, image_url, is_open
                FROM restaurants r
                WHERE r.is_open = TRUE
                """);

        List<Object> params = new ArrayList<>();

        if (search != null && !search.isBlank()) {
            String pattern = "%" + search.trim().toLowerCase() + "%";
            sql.append("""
                     AND (
                        LOWER(r.name) LIKE ?
                        OR LOWER(r.cuisine_type) LIKE ?
                        OR EXISTS (
                            SELECT 1 FROM menu_items m
                            WHERE m.restaurant_id = r.id
                              AND m.is_available = TRUE
                              AND (LOWER(m.name) LIKE ? OR LOWER(m.category) LIKE ?)
                        )
                    )
                    """);
            params.add(pattern);
            params.add(pattern);
            params.add(pattern);
            params.add(pattern);
        }

        if (cuisine != null && !cuisine.isBlank() && !"All".equalsIgnoreCase(cuisine.trim())) {
            String cuisinePattern = "%" + cuisine.trim().toLowerCase() + "%";
            sql.append(" AND LOWER(r.cuisine_type) LIKE ?");
            params.add(cuisinePattern);
        }

        sql.append(" ORDER BY r.rating DESC, r.delivery_time_mins ASC");

        return jdbcTemplate.query(sql.toString(), RESTAURANT_ROW_MAPPER, params.toArray());
    }

    public Optional<Restaurant> findById(Integer id) {
        String sql = """
                SELECT id, name, cuisine_type, description, address, rating,
                       delivery_time_mins, delivery_fee, image_url, is_open
                FROM restaurants
                WHERE id = ?
                """;
        List<Restaurant> results = jdbcTemplate.query(sql, RESTAURANT_ROW_MAPPER, id);
        return results.stream().findFirst();
    }

    public List<MenuItem> findMenuItemsByRestaurantId(Integer restaurantId, Boolean vegOnly, String search) {
        StringBuilder sql = new StringBuilder("""
                SELECT id, restaurant_id, name, description, category, price, is_veg, is_available, image_url
                FROM menu_items
                WHERE restaurant_id = ? AND is_available = TRUE
                """);

        List<Object> params = new ArrayList<>();
        params.add(restaurantId);

        if (Boolean.TRUE.equals(vegOnly)) {
            sql.append(" AND is_veg = TRUE");
        }

        if (search != null && !search.isBlank()) {
            String pattern = "%" + search.trim().toLowerCase() + "%";
            sql.append(" AND (LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR LOWER(category) LIKE ?)");
            params.add(pattern);
            params.add(pattern);
            params.add(pattern);
        }

        sql.append(" ORDER BY category ASC, id ASC");
        return jdbcTemplate.query(sql.toString(), MENU_ITEM_ROW_MAPPER, params.toArray());
    }

    public Optional<MenuItem> findMenuItemById(Integer menuItemId) {
        String sql = """
                SELECT id, restaurant_id, name, description, category, price, is_veg, is_available, image_url
                FROM menu_items
                WHERE id = ?
                """;
        List<MenuItem> results = jdbcTemplate.query(sql, MENU_ITEM_ROW_MAPPER, menuItemId);
        return results.stream().findFirst();
    }

    /**
     * Fetches popular dishes across top restaurants using an INNER JOIN.
     */
    public List<MenuItemWithRestaurantDto> findPopularDishes(int limit) {
        String sql = """
                SELECT m.id, m.restaurant_id, r.name AS restaurant_name, r.delivery_time_mins,
                       m.name, m.description, m.category, m.price, m.is_veg, m.is_available, m.image_url
                FROM menu_items m
                INNER JOIN restaurants r ON r.id = m.restaurant_id
                WHERE r.is_open = TRUE AND m.is_available = TRUE
                ORDER BY r.rating DESC, m.id ASC
                LIMIT ?
                """;
        return jdbcTemplate.query(sql, MENU_WITH_RESTAURANT_MAPPER, limit);
    }

    /**
     * Searches food items directly across all open restaurants.
     */
    public List<MenuItemWithRestaurantDto> searchDishes(String query) {
        String pattern = "%" + query.trim().toLowerCase() + "%";
        String sql = """
                SELECT m.id, m.restaurant_id, r.name AS restaurant_name, r.delivery_time_mins,
                       m.name, m.description, m.category, m.price, m.is_veg, m.is_available, m.image_url
                FROM menu_items m
                INNER JOIN restaurants r ON r.id = m.restaurant_id
                WHERE r.is_open = TRUE
                  AND m.is_available = TRUE
                  AND (LOWER(m.name) LIKE ? OR LOWER(m.category) LIKE ? OR LOWER(m.description) LIKE ?)
                ORDER BY r.rating DESC, m.price ASC
                LIMIT 24
                """;
        return jdbcTemplate.query(sql, MENU_WITH_RESTAURANT_MAPPER, pattern, pattern, pattern);
    }
}

