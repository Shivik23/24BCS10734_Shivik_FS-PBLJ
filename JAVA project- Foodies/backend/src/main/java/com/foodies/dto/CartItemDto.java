package com.foodies.dto;

import java.math.BigDecimal;

/**
 * Represents a dish inside the customer's active cart along with restaurant context.
 */
public class CartItemDto {

    private Integer cartItemId;
    private Integer menuItemId;
    private Integer restaurantId;
    private String restaurantName;
    private String restaurantCuisine;
    private Integer deliveryTimeMins;
    private BigDecimal restaurantDeliveryFee;
    private String itemName;
    private String description;
    private String category;
    private BigDecimal unitPrice;
    private Boolean isVeg;
    private String imageUrl;
    private Integer quantity;
    private BigDecimal lineTotal;

    public Integer getCartItemId() {
        return cartItemId;
    }

    public void setCartItemId(Integer cartItemId) {
        this.cartItemId = cartItemId;
    }

    public Integer getMenuItemId() {
        return menuItemId;
    }

    public void setMenuItemId(Integer menuItemId) {
        this.menuItemId = menuItemId;
    }

    public Integer getRestaurantId() {
        return restaurantId;
    }

    public void setRestaurantId(Integer restaurantId) {
        this.restaurantId = restaurantId;
    }

    public String getRestaurantName() {
        return restaurantName;
    }

    public void setRestaurantName(String restaurantName) {
        this.restaurantName = restaurantName;
    }

    public String getRestaurantCuisine() {
        return restaurantCuisine;
    }

    public void setRestaurantCuisine(String restaurantCuisine) {
        this.restaurantCuisine = restaurantCuisine;
    }

    public Integer getDeliveryTimeMins() {
        return deliveryTimeMins;
    }

    public void setDeliveryTimeMins(Integer deliveryTimeMins) {
        this.deliveryTimeMins = deliveryTimeMins;
    }

    public BigDecimal getRestaurantDeliveryFee() {
        return restaurantDeliveryFee;
    }

    public void setRestaurantDeliveryFee(BigDecimal restaurantDeliveryFee) {
        this.restaurantDeliveryFee = restaurantDeliveryFee;
    }

    public String getItemName() {
        return itemName;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public Boolean getIsVeg() {
        return isVeg;
    }

    public void setIsVeg(Boolean isVeg) {
        this.isVeg = isVeg;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getLineTotal() {
        return lineTotal;
    }

    public void setLineTotal(BigDecimal lineTotal) {
        this.lineTotal = lineTotal;
    }
}

