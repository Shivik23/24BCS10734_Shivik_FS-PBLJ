package com.foodies.controller;

import com.foodies.dto.LoginRequest;
import com.foodies.dto.RegisterRequest;
import com.foodies.dto.UserResponse;
import com.foodies.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Customer authentication endpoints using HTTP sessions and BCrypt password hashing.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletRequest httpRequest
    ) {
        UserResponse user = authService.register(request);
        HttpSession oldSession = httpRequest.getSession(false);
        if (oldSession != null) {
            oldSession.invalidate();
        }
        HttpSession session = httpRequest.getSession(true);
        session.setAttribute(SessionHelper.SESSION_USER_ID, user.getId());

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Welcome to Foodies! Your account has been created.",
                "user", user
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest
    ) {
        UserResponse user = authService.login(request);
        HttpSession oldSession = httpRequest.getSession(false);
        if (oldSession != null) {
            oldSession.invalidate();
        }
        HttpSession session = httpRequest.getSession(true);
        session.setAttribute(SessionHelper.SESSION_USER_ID, user.getId());

        return ResponseEntity.ok(Map.of(
                "message", "Signed in successfully.",
                "user", user
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return ResponseEntity.ok(Map.of("message", "You have been logged out."));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> currentUser(HttpSession session) {
        Integer userId = SessionHelper.requireUserId(session);
        return ResponseEntity.ok(authService.getUserProfile(userId));
    }
}

