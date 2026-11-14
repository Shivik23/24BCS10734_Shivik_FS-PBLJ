package com.foodies.repository;

import com.foodies.dto.CartItemDto;
import com.foodies.model.CartItem;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;

/**
 * JDBC repository for managing a customer's persisted shopping cart in PostgreSQL.
 */
@Repository
public class CartRepository {

    private final JdbcTemplate jdbcTemplate;

    private static final RowMapper<CartItem> CART_ITEM_ROW_MAPPER = (rs, rowNum) -> {
        CartItem item = new CartItem();
        item.setId(rs.getInt("id"));
        item.setUserId(rs.getInt("user_id"));
        item.setMenuItemId(rs.getInt("menu_item_id"));
        item.setQuantity(rs.getInt("quantity"));
        Timestamp createdAt = rs.getTimestamp("created_at");
        if (createdAt != null) {
            item.setCreatedAt(createdAt.toLocalDateTime());
        }
        return item;
    };

    private static final RowMapper<CartItemDto> CART_DETAIL_MAPPER = (rs, rowNum) -> {
        CartItemDto dto = new CartItemDto();
        dto.setCartItemId(rs.getInt("cart_item_id"));
        dto.setMenuItemId(rs.getInt("menu_item_id"));
        dto.setRestaurantId(rs.getInt("restaurant_id"));
        dto.setRestaurantName(rs.getString("restaurant_name"));
        dto.setRestaurantCuisine(rs.getString("cuisine_type"));
        dto.setDeliveryTimeMins(rs.getInt("delivery_time_mins"));
        dto.setRestaurantDeliveryFee(rs.getBigDecimal("delivery_fee"));
        dto.setItemName(rs.getString("item_name"));
        dto.setDescription(rs.getString("description"));
        dto.setCategory(rs.getString("category"));
        BigDecimal unitPrice = rs.getBigDecimal("unit_price");
        int quantity = rs.getInt("quantity");
        dto.setUnitPrice(unitPrice);
        dto.setIsVeg(rs.getBoolean("is_veg"));
        dto.setImageUrl(rs.getString("image_url"));
        dto.setQuantity(quantity);
        dto.setLineTotal(unitPrice.multiply(BigDecimal.valueOf(quantity)));
        return dto;
    };

    public CartRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * Multi-table INNER JOIN retrieving all cart items with live database prices.
     */
    public List<CartItemDto> findCartDetailsByUserId(Integer userId) {
        String sql = """
                SELECT
                    c.id AS cart_item_id,
                    m.id AS menu_item_id,
                    r.id AS restaurant_id,
                    r.name AS restaurant_name,
                    r.cuisine_type,
                    r.delivery_time_mins,
                    r.delivery_fee,
                    m.name AS item_name,
                    m.description,
                    m.category,
                    m.price AS unit_price,
                    m.is_veg,
                    m.image_url,
                    c.quantity
                FROM cart_items c
                INNER JOIN menu_items m ON m.id = c.menu_item_id
                INNER JOIN restaurants r ON r.id = m.restaurant_id
                WHERE c.user_id = ?
                ORDER BY c.created_at ASC, c.id ASC
                """;
        return jdbcTemplate.query(sql, CART_DETAIL_MAPPER, userId);
    }

    public List<Integer> findDistinctRestaurantIdsInCart(Integer userId) {
        String sql = """
                SELECT DISTINCT m.restaurant_id
                FROM cart_items c
                INNER JOIN menu_items m ON m.id = c.menu_item_id
                WHERE c.user_id = ?
                """;
        return jdbcTemplate.queryForList(sql, Integer.class, userId);
    }

    public Optional<CartItem> findByUserAndMenuItem(Integer userId, Integer menuItemId) {
        String sql = """
                SELECT id, user_id, menu_item_id, quantity, created_at
                FROM cart_items
                WHERE user_id = ? AND menu_item_id = ?
                """;
        List<CartItem> results = jdbcTemplate.query(sql, CART_ITEM_ROW_MAPPER, userId, menuItemId);
        return results.stream().findFirst();
    }

    public void insertCartItem(Integer userId, Integer menuItemId, Integer quantity) {
        String sql = "INSERT INTO cart_items (user_id, menu_item_id, quantity) VALUES (?, ?, ?)";
        jdbcTemplate.update(sql, userId, menuItemId, quantity);
    }

    public void updateQuantity(Integer userId, Integer menuItemId, Integer quantity) {
        String sql = "UPDATE cart_items SET quantity = ? WHERE user_id = ? AND menu_item_id = ?";
        jdbcTemplate.update(sql, quantity, userId, menuItemId);
    }

    public int deleteItem(Integer userId, Integer menuItemId) {
        String sql = "DELETE FROM cart_items WHERE user_id = ? AND menu_item_id = ?";
        return jdbcTemplate.update(sql, userId, menuItemId);
    }

    public void clearCart(Integer userId) {
        String sql = "DELETE FROM cart_items WHERE user_id = ?";
        jdbcTemplate.update(sql, userId);
    }
}

