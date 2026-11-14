package com.foodies.service;

import com.foodies.dto.CartAddRequest;
import com.foodies.dto.CartItemDto;
import com.foodies.dto.CheckoutRequest;
import com.foodies.dto.OrderResponse;
import com.foodies.exception.ConflictException;
import com.foodies.model.MenuItem;
import com.foodies.model.Restaurant;
import com.foodies.repository.CartRepository;
import com.foodies.repository.OrderRepository;
import com.foodies.repository.RestaurantRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests verifying single-restaurant cart rules and authoritative server-side order calculations.
 */
@ExtendWith(MockitoExtension.class)
class OrderAndCartServiceTest {

    @Mock
    private CartRepository cartRepository;

    @Mock
    private RestaurantRepository restaurantRepository;

    @Mock
    private OrderRepository orderRepository;

    @InjectMocks
    private CartService cartService;

    @InjectMocks
    private OrderService orderService;

    @Test
    void addToCartThrowsConflictWhenCartContainsDifferentRestaurant() {
        MenuItem item = new MenuItem();
        item.setId(15);
        item.setRestaurantId(2);
        item.setIsAvailable(true);

        Restaurant restaurant = new Restaurant();
        restaurant.setId(2);
        restaurant.setIsOpen(true);

        when(restaurantRepository.findMenuItemById(15)).thenReturn(Optional.of(item));
        when(restaurantRepository.findById(2)).thenReturn(Optional.of(restaurant));
        when(cartRepository.findDistinctRestaurantIdsInCart(1)).thenReturn(List.of(1));

        CartAddRequest request = new CartAddRequest();
        request.setMenuItemId(15);
        request.setQuantity(1);
        request.setReplaceExisting(false);

        ConflictException ex = assertThrows(
                ConflictException.class,
                () -> cartService.addToCart(1, request)
        );
        assertEquals("DIFFERENT_RESTAURANT", ex.getCode());
    }

    @Test
    void placeOrderCalculatesAuthoritativeTotalsAndInvokesStoredProcedure() {
        CartItemDto item1 = new CartItemDto();
        item1.setMenuItemId(1);
        item1.setRestaurantId(1);
        item1.setItemName("Hyderabadi Chicken Dum Biryani");
        item1.setUnitPrice(new BigDecimal("299.00"));
        item1.setQuantity(2);

        Restaurant restaurant = new Restaurant();
        restaurant.setId(1);
        restaurant.setDeliveryFee(new BigDecimal("35.00"));

        OrderResponse expectedOrder = new OrderResponse();
        expectedOrder.setId(101);
        expectedOrder.setTotalAmount(new BigDecimal("633.00"));

        when(cartRepository.findCartDetailsByUserId(1)).thenReturn(List.of(item1));
        when(cartRepository.findDistinctRestaurantIdsInCart(1)).thenReturn(List.of(1));
        when(restaurantRepository.findById(1)).thenReturn(Optional.of(restaurant));
        when(orderRepository.insertOrder(any())).thenReturn(101);
        when(orderRepository.findOrderByIdAndUserId(101, 1)).thenReturn(Optional.of(expectedOrder));

        CheckoutRequest checkout = new CheckoutRequest();
        checkout.setDeliveryAddress("221B Residency Road, Bengaluru");
        checkout.setContactPhone("9876543210");
        checkout.setPaymentMethod("UPI");

        OrderResponse response = orderService.placeOrder(1, checkout);

        assertEquals(new BigDecimal("633.00"), response.getTotalAmount());

        ArgumentCaptor<com.foodies.model.Order> orderCaptor =
                ArgumentCaptor.forClass(com.foodies.model.Order.class);
        verify(orderRepository).insertOrder(orderCaptor.capture());
        assertEquals(new BigDecimal("598.00"), orderCaptor.getValue().getSubtotal());
        assertEquals(new BigDecimal("35.00"), orderCaptor.getValue().getDeliveryFee());
        assertEquals(new BigDecimal("633.00"), orderCaptor.getValue().getTotalAmount());

        verify(orderRepository).callRecordPaymentAndClearCart(
                eq(101),
                eq(1),
                eq("UPI"),
                eq(new BigDecimal("633.00")),
                anyString()
        );
    }
}

