package com.foodies.controller;

import com.foodies.dto.CartAddRequest;
import com.foodies.dto.CartResponse;
import com.foodies.dto.CartUpdateRequest;
import com.foodies.service.CartService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Authenticated customer shopping cart endpoints backed by PostgreSQL cart_items.
 */
@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<CartResponse> getCart(HttpSession session) {
        Integer userId = SessionHelper.requireUserId(session);
        return ResponseEntity.ok(cartService.getCart(userId));
    }

    @PostMapping("/items")
    public ResponseEntity<CartResponse> addItem(
            @Valid @RequestBody CartAddRequest request,
            HttpSession session
    ) {
        Integer userId = SessionHelper.requireUserId(session);
        return ResponseEntity.ok(cartService.addToCart(userId, request));
    }

    @PutMapping("/items/{menuItemId}")
    public ResponseEntity<CartResponse> updateQuantity(
            @PathVariable Integer menuItemId,
            @Valid @RequestBody CartUpdateRequest request,
            HttpSession session
    ) {
        Integer userId = SessionHelper.requireUserId(session);
        return ResponseEntity.ok(cartService.updateQuantity(userId, menuItemId, request.getQuantity()));
    }

    @DeleteMapping("/items/{menuItemId}")
    public ResponseEntity<CartResponse> removeItem(
            @PathVariable Integer menuItemId,
            HttpSession session
    ) {
        Integer userId = SessionHelper.requireUserId(session);
        return ResponseEntity.ok(cartService.removeItem(userId, menuItemId));
    }

    @DeleteMapping
    public ResponseEntity<CartResponse> clearCart(HttpSession session) {
        Integer userId = SessionHelper.requireUserId(session);
        return ResponseEntity.ok(cartService.clearCart(userId));
    }
}

