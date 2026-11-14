package com.foodies.exception;

/**
 * Thrown when an operation conflicts with existing state
 * (e.g., duplicate email or single-restaurant cart conflict).
 */
public class ConflictException extends RuntimeException {

    private final String code;

    public ConflictException(String code, String message) {
        super(message);
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}

