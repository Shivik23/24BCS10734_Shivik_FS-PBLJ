package com.foodies.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Request payload for placing an order at checkout.
 * Prices and totals are NEVER accepted from the client; they are computed on the server.
 */
public class CheckoutRequest {

    @NotBlank(message = "Delivery address is required.")
    @Size(min = 5, max = 300, message = "Delivery address must be between 5 and 300 characters.")
    private String deliveryAddress;

    @NotBlank(message = "Contact phone number is required.")
    @Pattern(regexp = "^[0-9+\\-\\s]{10,15}$", message = "Please enter a valid 10-15 digit contact number.")
    private String contactPhone;

    @NotBlank(message = "Payment method is required.")
    @Pattern(
            regexp = "^(Cash on Delivery|UPI|Card)$",
            message = "Payment method must be Cash on Delivery, UPI, or Card."
    )
    private String paymentMethod;

    @Size(max = 255, message = "Order notes cannot exceed 255 characters.")
    private String orderNotes;

    public String getDeliveryAddress() {
        return deliveryAddress;
    }

    public void setDeliveryAddress(String deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getOrderNotes() {
        return orderNotes;
    }

    public void setOrderNotes(String orderNotes) {
        this.orderNotes = orderNotes;
    }
}

