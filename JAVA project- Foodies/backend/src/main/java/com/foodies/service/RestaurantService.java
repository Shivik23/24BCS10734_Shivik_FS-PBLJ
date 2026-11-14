package com.foodies.service;

import com.foodies.dto.MenuItemWithRestaurantDto;
import com.foodies.exception.ResourceNotFoundException;
import com.foodies.model.MenuItem;
import com.foodies.model.Restaurant;
import com.foodies.repository.RestaurantRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Provides customer-facing restaurant discovery and menu browsing operations.
 */
@Service
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;

    public RestaurantService(RestaurantRepository restaurantRepository) {
        this.restaurantRepository = restaurantRepository;
    }

    public List<Restaurant> getRestaurants(String search, String cuisine) {
        return restaurantRepository.findAll(search, cuisine);
    }

    public Restaurant getRestaurantById(Integer id) {
        return restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found."));
    }

    public List<MenuItem> getRestaurantMenu(Integer restaurantId, Boolean vegOnly, String search) {
        // Verify restaurant exists before returning menu items
        getRestaurantById(restaurantId);
        return restaurantRepository.findMenuItemsByRestaurantId(restaurantId, vegOnly, search);
    }

    public List<MenuItemWithRestaurantDto> getPopularDishes() {
        return restaurantRepository.findPopularDishes(8);
    }

    public List<MenuItemWithRestaurantDto> searchDishes(String query) {
        if (query == null || query.isBlank()) {
            return getPopularDishes();
        }
        return restaurantRepository.searchDishes(query);
    }
}

