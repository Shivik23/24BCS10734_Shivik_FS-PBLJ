package com.foodies.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * Request body for adding a dish to the customer's cart.
 */
public class CartAddRequest {

    @NotNull(message = "Menu item ID is required.")
    private Integer menuItemId;

    @Min(value = 1, message = "Quantity must be at least 1.")
    @Max(value = 20, message = "Maximum 20 units per item.")
    private Integer quantity = 1;

    private boolean replaceExisting = false;

    public Integer getMenuItemId() {
        return menuItemId;
    }

    public void setMenuItemId(Integer menuItemId) {
        this.menuItemId = menuItemId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public boolean isReplaceExisting() {
        return replaceExisting;
    }

    public void setReplaceExisting(boolean replaceExisting) {
        this.replaceExisting = replaceExisting;
    }
}

