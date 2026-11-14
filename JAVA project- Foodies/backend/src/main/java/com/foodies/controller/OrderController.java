package com.foodies.controller;

import com.foodies.dto.CheckoutRequest;
import com.foodies.dto.OrderResponse;
import com.foodies.service.OrderService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Authenticated customer checkout and order history endpoints.
 */
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<OrderResponse> placeOrder(
            @Valid @RequestBody CheckoutRequest request,
            HttpSession session
    ) {
        Integer userId = SessionHelper.requireUserId(session);
        OrderResponse created = orderService.placeOrder(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getOrderHistory(HttpSession session) {
        Integer userId = SessionHelper.requireUserId(session);
        return ResponseEntity.ok(orderService.getCustomerOrders(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderDetails(
            @PathVariable Integer id,
            HttpSession session
    ) {
        Integer userId = SessionHelper.requireUserId(session);
        return ResponseEntity.ok(orderService.getOrderById(id, userId));
    }
}

