package com.foodies.controller;

import com.foodies.exception.UnauthorizedException;
import jakarta.servlet.http.HttpSession;

/**
 * Shared helper for reading and setting the authenticated customer ID in HttpSession.
 */
public final class SessionHelper {

    public static final String SESSION_USER_ID = "FOODIES_USER_ID";

    private SessionHelper() {
    }

    public static Integer getOptionalUserId(HttpSession session) {
        if (session == null) {
            return null;
        }
        Object attr = session.getAttribute(SESSION_USER_ID);
        return (attr instanceof Integer id) ? id : null;
    }

    public static Integer requireUserId(HttpSession session) {
        Integer userId = getOptionalUserId(session);
        if (userId == null) {
            throw new UnauthorizedException("Please log in to continue.");
        }
        return userId;
    }
}

