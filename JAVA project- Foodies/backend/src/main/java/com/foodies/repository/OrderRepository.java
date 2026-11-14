package com.foodies.repository;

import com.foodies.dto.OrderItemDto;
import com.foodies.dto.OrderResponse;
import com.foodies.model.Order;
import com.foodies.model.OrderItem;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;

/**
 * JDBC repository for order creation, stored-procedure payment recording, and order history queries.
 */
@Repository
public class OrderRepository {

    private final JdbcTemplate jdbcTemplate;

    private static final RowMapper<OrderResponse> ORDER_RESPONSE_MAPPER = (rs, rowNum) -> {
        OrderResponse dto = new OrderResponse();
        dto.setId(rs.getInt("id"));
        dto.setRestaurantId(rs.getInt("restaurant_id"));
        dto.setRestaurantName(rs.getString("restaurant_name"));
        dto.setRestaurantImageUrl(rs.getString("restaurant_image_url"));
        dto.setDeliveryAddress(rs.getString("delivery_address"));
        dto.setContactPhone(rs.getString("contact_phone"));
        dto.setPaymentMethod(rs.getString("payment_method"));
        dto.setPaymentStatus(rs.getString("payment_status"));
        dto.setTransactionRef(rs.getString("transaction_ref"));
        dto.setSubtotal(rs.getBigDecimal("subtotal"));
        dto.setDeliveryFee(rs.getBigDecimal("delivery_fee"));
        dto.setTotalAmount(rs.getBigDecimal("total_amount"));
        dto.setStatus(rs.getString("status"));
        dto.setOrderNotes(rs.getString("order_notes"));
        Timestamp createdAt = rs.getTimestamp("created_at");
        if (createdAt != null) {
            dto.setCreatedAt(createdAt.toLocalDateTime());
        }
        return dto;
    };

    private static final RowMapper<OrderItemDto> ORDER_ITEM_MAPPER = (rs, rowNum) -> {
        OrderItemDto dto = new OrderItemDto();
        dto.setId(rs.getInt("id"));
        dto.setMenuItemId(rs.getInt("menu_item_id"));
        dto.setItemName(rs.getString("item_name"));
        BigDecimal unitPrice = rs.getBigDecimal("unit_price");
        int quantity = rs.getInt("quantity");
        dto.setUnitPrice(unitPrice);
        dto.setQuantity(quantity);
        dto.setLineTotal(unitPrice.multiply(BigDecimal.valueOf(quantity)));
        return dto;
    };

    public OrderRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Integer insertOrder(Order order) {
        String sql = """
                INSERT INTO orders (
                    user_id, restaurant_id, delivery_address, contact_phone,
                    payment_method, subtotal, delivery_fee, total_amount, status, order_notes
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                RETURNING id
                """;
        return jdbcTemplate.queryForObject(
                sql,
                Integer.class,
                order.getUserId(),
                order.getRestaurantId(),
                order.getDeliveryAddress(),
                order.getContactPhone(),
                order.getPaymentMethod(),
                order.getSubtotal(),
                order.getDeliveryFee(),
                order.getTotalAmount(),
                order.getStatus(),
                order.getOrderNotes()
        );
    }

    public void insertOrderItems(Integer orderId, List<OrderItem> items) {
        String sql = """
                INSERT INTO order_items (order_id, menu_item_id, item_name, unit_price, quantity)
                VALUES (?, ?, ?, ?, ?)
                """;
        jdbcTemplate.batchUpdate(sql, items, items.size(), (ps, item) -> {
            ps.setInt(1, orderId);
            ps.setInt(2, item.getMenuItemId());
            ps.setString(3, item.getItemName());
            ps.setBigDecimal(4, item.getUnitPrice());
            ps.setInt(5, item.getQuantity());
        });
    }

    /**
     * Calls PostgreSQL PL/pgSQL stored procedure sp_record_payment_and_clear_cart
     * inside the active Spring @Transactional checkout boundary.
     */
    public void callRecordPaymentAndClearCart(
            Integer orderId,
            Integer userId,
            String paymentMethod,
            BigDecimal amount,
            String transactionRef
    ) {
        jdbcTemplate.update(
                "CALL sp_record_payment_and_clear_cart(?, ?, ?, ?, ?)",
                orderId,
                userId,
                paymentMethod,
                amount,
                transactionRef
        );
    }

    public List<OrderResponse> findOrdersByUserId(Integer userId) {
        String sql = """
                SELECT
                    o.id,
                    o.restaurant_id,
                    r.name AS restaurant_name,
                    r.image_url AS restaurant_image_url,
                    o.delivery_address,
                    o.contact_phone,
                    o.payment_method,
                    COALESCE(p.payment_status, 'PENDING') AS payment_status,
                    p.transaction_ref,
                    o.subtotal,
                    o.delivery_fee,
                    o.total_amount,
                    o.status,
                    o.order_notes,
                    o.created_at
                FROM orders o
                INNER JOIN restaurants r ON r.id = o.restaurant_id
                LEFT JOIN payments p ON p.order_id = o.id
                WHERE o.user_id = ?
                ORDER BY o.created_at DESC, o.id DESC
                """;
        List<OrderResponse> orders = jdbcTemplate.query(sql, ORDER_RESPONSE_MAPPER, userId);
        for (OrderResponse order : orders) {
            order.setItems(findItemsByOrderId(order.getId()));
        }
        return orders;
    }

    public Optional<OrderResponse> findOrderByIdAndUserId(Integer orderId, Integer userId) {
        String sql = """
                SELECT
                    o.id,
                    o.restaurant_id,
                    r.name AS restaurant_name,
                    r.image_url AS restaurant_image_url,
                    o.delivery_address,
                    o.contact_phone,
                    o.payment_method,
                    COALESCE(p.payment_status, 'PENDING') AS payment_status,
                    p.transaction_ref,
                    o.subtotal,
                    o.delivery_fee,
                    o.total_amount,
                    o.status,
                    o.order_notes,
                    o.created_at
                FROM orders o
                INNER JOIN restaurants r ON r.id = o.restaurant_id
                LEFT JOIN payments p ON p.order_id = o.id
                WHERE o.id = ? AND o.user_id = ?
                """;
        List<OrderResponse> results = jdbcTemplate.query(sql, ORDER_RESPONSE_MAPPER, orderId, userId);
        Optional<OrderResponse> order = results.stream().findFirst();
        order.ifPresent(o -> o.setItems(findItemsByOrderId(o.getId())));
        return order;
    }

    private List<OrderItemDto> findItemsByOrderId(Integer orderId) {
        String sql = """
                SELECT id, menu_item_id, item_name, unit_price, quantity
                FROM order_items
                WHERE order_id = ?
                ORDER BY id ASC
                """;
        return jdbcTemplate.query(sql, ORDER_ITEM_MAPPER, orderId);
    }
}

