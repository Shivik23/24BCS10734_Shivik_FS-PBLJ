package com.foodies.exception;

/**
 * Thrown when a requested restaurant, menu item, cart item, or order is not found.
 */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}

