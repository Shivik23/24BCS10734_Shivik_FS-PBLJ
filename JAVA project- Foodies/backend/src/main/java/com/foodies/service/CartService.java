package com.foodies.service;

import com.foodies.dto.CartAddRequest;
import com.foodies.dto.CartItemDto;
import com.foodies.dto.CartResponse;
import com.foodies.exception.BadRequestException;
import com.foodies.exception.ConflictException;
import com.foodies.exception.ResourceNotFoundException;
import com.foodies.model.CartItem;
import com.foodies.model.MenuItem;
import com.foodies.model.Restaurant;
import com.foodies.repository.CartRepository;
import com.foodies.repository.RestaurantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

/**
 * Manages persisted cart items and enforces the single-restaurant cart rule.
 */
@Service
public class CartService {

    private final CartRepository cartRepository;
    private final RestaurantRepository restaurantRepository;

    public CartService(CartRepository cartRepository, RestaurantRepository restaurantRepository) {
        this.cartRepository = cartRepository;
        this.restaurantRepository = restaurantRepository;
    }

    public CartResponse getCart(Integer userId) {
        List<CartItemDto> items = cartRepository.findCartDetailsByUserId(userId);
        return buildCartResponse(items);
    }

    @Transactional
    public CartResponse addToCart(Integer userId, CartAddRequest request) {
        MenuItem menuItem = restaurantRepository.findMenuItemById(request.getMenuItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Selected dish was not found."));

        if (!Boolean.TRUE.equals(menuItem.getIsAvailable())) {
            throw new BadRequestException("This dish is currently unavailable.");
        }

        Restaurant restaurant = restaurantRepository.findById(menuItem.getRestaurantId())
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found."));

        if (!Boolean.TRUE.equals(restaurant.getIsOpen())) {
            throw new BadRequestException("This restaurant is currently closed for orders.");
        }

        // Enforce single-restaurant cart rule
        List<Integer> existingRestaurants = cartRepository.findDistinctRestaurantIdsInCart(userId);
        if (!existingRestaurants.isEmpty() && !existingRestaurants.contains(menuItem.getRestaurantId())) {
            if (!request.isReplaceExisting()) {
                throw new ConflictException(
                        "DIFFERENT_RESTAURANT",
                        "Your cart already contains items from another restaurant. Replace your cart to add this dish?"
                );
            }
            cartRepository.clearCart(userId);
        }

        int quantityToAdd = request.getQuantity() == null ? 1 : request.getQuantity();
        Optional<CartItem> existingItem = cartRepository.findByUserAndMenuItem(userId, menuItem.getId());
        if (existingItem.isPresent()) {
            int updatedQty = Math.min(20, existingItem.get().getQuantity() + quantityToAdd);
            cartRepository.updateQuantity(userId, menuItem.getId(), updatedQty);
        } else {
            cartRepository.insertCartItem(userId, menuItem.getId(), quantityToAdd);
        }

        return getCart(userId);
    }

    @Transactional
    public CartResponse updateQuantity(Integer userId, Integer menuItemId, Integer quantity) {
        if (quantity <= 0) {
            cartRepository.deleteItem(userId, menuItemId);
            return getCart(userId);
        }

        CartItem existing = cartRepository.findByUserAndMenuItem(userId, menuItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found in your cart."));
        cartRepository.updateQuantity(userId, existing.getMenuItemId(), Math.min(20, quantity));
        return getCart(userId);
    }

    @Transactional
    public CartResponse removeItem(Integer userId, Integer menuItemId) {
        int removed = cartRepository.deleteItem(userId, menuItemId);
        if (removed == 0) {
            throw new ResourceNotFoundException("Item not found in your cart.");
        }
        return getCart(userId);
    }

    @Transactional
    public CartResponse clearCart(Integer userId) {
        cartRepository.clearCart(userId);
        return getCart(userId);
    }

    private CartResponse buildCartResponse(List<CartItemDto> items) {
        CartResponse response = new CartResponse();
        response.setItems(items);

        if (items.isEmpty()) {
            response.setTotalQuantity(0);
            response.setSubtotal(BigDecimal.ZERO);
            response.setDeliveryFee(BigDecimal.ZERO);
            response.setTotalAmount(BigDecimal.ZERO);
            return response;
        }

        CartItemDto first = items.get(0);
        response.setRestaurantId(first.getRestaurantId());
        response.setRestaurantName(first.getRestaurantName());
        response.setRestaurantCuisine(first.getRestaurantCuisine());
        response.setDeliveryTimeMins(first.getDeliveryTimeMins());

        int totalQuantity = 0;
        BigDecimal subtotal = BigDecimal.ZERO;
        for (CartItemDto item : items) {
            totalQuantity += item.getQuantity();
            subtotal = subtotal.add(item.getLineTotal());
        }

        BigDecimal deliveryFee = first.getRestaurantDeliveryFee();
        response.setTotalQuantity(totalQuantity);
        response.setSubtotal(subtotal);
        response.setDeliveryFee(deliveryFee);
        response.setTotalAmount(subtotal.add(deliveryFee));
        return response;
    }
}

