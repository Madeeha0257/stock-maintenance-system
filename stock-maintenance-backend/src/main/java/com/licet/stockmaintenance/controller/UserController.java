package com.licet.stockmaintenance.controller;

import com.licet.stockmaintenance.entity.User;
import com.licet.stockmaintenance.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/api/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {

        String username = loginRequest.get("username");
        String password = loginRequest.get("password");

        if (username == null || password == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid username or password");
        }

        var user = userService.login(username, password);

        if (user.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid username or password");
        }

        return ResponseEntity.ok(createLoginResponse(user.get()));
    }

    private Map<String, Object> createLoginResponse(User user) {
        Map<String, Object> response = new HashMap<>();

        response.put("userID", user.getUserID());
        response.put("username", user.getUsername());
        response.put("role", user.getRole());

        return response;
    }
}