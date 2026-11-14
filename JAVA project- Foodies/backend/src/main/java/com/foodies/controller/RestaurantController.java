package com.foodies.controller;

import com.foodies.dto.MenuItemWithRestaurantDto;
import com.foodies.model.MenuItem;
import com.foodies.model.Restaurant;
import com.foodies.service.RestaurantService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Public endpoints for browsing restaurants, food menus, and dish searches.
 */
@RestController
@RequestMapping("/api")
public class RestaurantController {

    private final RestaurantService restaurantService;

    public RestaurantController(RestaurantService restaurantService) {
        this.restaurantService = restaurantService;
    }

    @GetMapping("/restaurants")
    public ResponseEntity<List<Restaurant>> listRestaurants(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String cuisine
    ) {
        return ResponseEntity.ok(restaurantService.getRestaurants(search, cuisine));
    }

    @GetMapping("/restaurants/{id}")
    public ResponseEntity<Map<String, Object>> getRestaurantDetails(@PathVariable Integer id) {
        Restaurant restaurant = restaurantService.getRestaurantById(id);
        List<MenuItem> menuItems = restaurantService.getRestaurantMenu(id, false, null);
        return ResponseEntity.ok(Map.of(
                "restaurant", restaurant,
                "menuItems", menuItems
        ));
    }

    @GetMapping("/restaurants/{id}/menu")
    public ResponseEntity<List<MenuItem>> getRestaurantMenu(
            @PathVariable Integer id,
            @RequestParam(required = false) Boolean vegOnly,
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(restaurantService.getRestaurantMenu(id, vegOnly, search));
    }

    @GetMapping("/dishes/popular")
    public ResponseEntity<List<MenuItemWithRestaurantDto>> getPopularDishes() {
        return ResponseEntity.ok(restaurantService.getPopularDishes());
    }

    @GetMapping("/dishes/search")
    public ResponseEntity<List<MenuItemWithRestaurantDto>> searchDishes(
            @RequestParam(required = false, defaultValue = "") String q
    ) {
        return ResponseEntity.ok(restaurantService.searchDishes(q));
    }
}

