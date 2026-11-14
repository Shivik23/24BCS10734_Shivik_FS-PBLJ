package com.foodies.model;

import java.math.BigDecimal;

/**
 * Represents a restaurant entry stored in the restaurants table.
 */
public class Restaurant {

    private Integer id;
    private String name;
    private String cuisineType;
    private String description;
    private String address;
    private BigDecimal rating;
    private Integer deliveryTimeMins;
    private BigDecimal deliveryFee;
    private String imageUrl;
    private Boolean isOpen;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCuisineType() {
        return cuisineType;
    }

    public void setCuisineType(String cuisineType) {
        this.cuisineType = cuisineType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public BigDecimal getRating() {
        return rating;
    }

    public void setRating(BigDecimal rating) {
        this.rating = rating;
    }

    public Integer getDeliveryTimeMins() {
        return deliveryTimeMins;
    }

    public void setDeliveryTimeMins(Integer deliveryTimeMins) {
        this.deliveryTimeMins = deliveryTimeMins;
    }

    public BigDecimal getDeliveryFee() {
        return deliveryFee;
    }

    public void setDeliveryFee(BigDecimal deliveryFee) {
        this.deliveryFee = deliveryFee;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Boolean getIsOpen() {
        return isOpen;
    }

    public void setIsOpen(Boolean isOpen) {
        this.isOpen = isOpen;
    }
}

