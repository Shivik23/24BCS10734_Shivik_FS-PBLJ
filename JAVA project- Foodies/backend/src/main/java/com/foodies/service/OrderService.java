package com.foodies.service;

import com.foodies.dto.CartItemDto;
import com.foodies.dto.CheckoutRequest;
import com.foodies.dto.OrderResponse;
import com.foodies.exception.BadRequestException;
import com.foodies.exception.ResourceNotFoundException;
import com.foodies.model.Order;
import com.foodies.model.OrderItem;
import com.foodies.model.Restaurant;
import com.foodies.repository.CartRepository;
import com.foodies.repository.OrderRepository;
import com.foodies.repository.RestaurantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Handles transactional order placement (orders + order_items + payments + cart cleanup)
 * and customer order history retrieval.
 */
@Service
public class OrderService {

    private final CartRepository cartRepository;
    private final RestaurantRepository restaurantRepository;
    private final OrderRepository orderRepository;

    public OrderService(
            CartRepository cartRepository,
            RestaurantRepository restaurantRepository,
            OrderRepository orderRepository
    ) {
        this.cartRepository = cartRepository;
        this.restaurantRepository = restaurantRepository;
        this.orderRepository = orderRepository;
    }

    /**
     * Places an order inside a single database transaction.
     * Any failure rolls back order creation, order items, payment, and cart clearing.
     */
    @Transactional(rollbackFor = Exception.class)
    public OrderResponse placeOrder(Integer userId, CheckoutRequest request) {
        List<CartItemDto> cartItems = cartRepository.findCartDetailsByUserId(userId);
        if (cartItems.isEmpty()) {
            throw new BadRequestException("Your cart is empty. Add items before checking out.");
        }

        List<Integer> restaurantIds = cartRepository.findDistinctRestaurantIdsInCart(userId);
        if (restaurantIds.size() != 1) {
            throw new BadRequestException("All items in an order must belong to a single restaurant.");
        }

        Integer restaurantId = restaurantIds.get(0);
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found."));

        // Always recompute subtotal and total using authoritative database prices
        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItemDto cartItem : cartItems) {
            BigDecimal authoritativeLine = cartItem.getUnitPrice()
                    .multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            subtotal = subtotal.add(authoritativeLine);

            OrderItem snapshot = new OrderItem();
            snapshot.setMenuItemId(cartItem.getMenuItemId());
            snapshot.setItemName(cartItem.getItemName());
            snapshot.setUnitPrice(cartItem.getUnitPrice());
            snapshot.setQuantity(cartItem.getQuantity());
            orderItems.add(snapshot);
        }

        BigDecimal deliveryFee = restaurant.getDeliveryFee();
        BigDecimal totalAmount = subtotal.add(deliveryFee);

        Order order = new Order();
        order.setUserId(userId);
        order.setRestaurantId(restaurantId);
        order.setDeliveryAddress(request.getDeliveryAddress().trim());
        order.setContactPhone(request.getContactPhone().trim());
        order.setPaymentMethod(request.getPaymentMethod().trim());
        order.setSubtotal(subtotal);
        order.setDeliveryFee(deliveryFee);
        order.setTotalAmount(totalAmount);
        order.setStatus("PLACED");
        order.setOrderNotes(
                request.getOrderNotes() != null && !request.getOrderNotes().isBlank()
                        ? request.getOrderNotes().trim()
                        : null
        );

        Integer orderId = orderRepository.insertOrder(order);
        orderRepository.insertOrderItems(orderId, orderItems);

        String transactionRef = "FD-" + orderId + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        orderRepository.callRecordPaymentAndClearCart(
                orderId,
                userId,
                order.getPaymentMethod(),
                totalAmount,
                transactionRef
        );

        return orderRepository.findOrderByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Placed order could not be loaded."));
    }

    public List<OrderResponse> getCustomerOrders(Integer userId) {
        return orderRepository.findOrdersByUserId(userId);
    }

    public OrderResponse getOrderById(Integer orderId, Integer userId) {
        return orderRepository.findOrderByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found."));
    }
}

