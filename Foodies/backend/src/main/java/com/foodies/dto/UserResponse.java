package com.foodies.dto;

/**
 * Safe customer profile response without exposing password hashes.
 */
public class UserResponse {

    private Integer id;
    private String fullName;
    private String email;
    private String phone;
    private String defaultAddress;

    public UserResponse() {
    }

    public UserResponse(Integer id, String fullName, String email, String phone, String defaultAddress) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.defaultAddress = defaultAddress;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getDefaultAddress() {
        return defaultAddress;
    }

    public void setDefaultAddress(String defaultAddress) {
        this.defaultAddress = defaultAddress;
    }
}

