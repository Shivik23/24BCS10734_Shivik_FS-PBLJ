package com.foodies.exception;

/**
 * Thrown when an unauthenticated user accesses a protected endpoint.
 */
public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
}

