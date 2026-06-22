package com.betlandia.api_gateway.controller;

import com.betlandia.api_gateway.security.JwtUtil;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final JwtUtil jwtUtil;
    private final WebClient betServiceClient;

    public AuthController(JwtUtil jwtUtil, @Qualifier("betServiceClient") WebClient betServiceClient) {
        this.jwtUtil = jwtUtil;
        this.betServiceClient = betServiceClient;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        try {
            String response = betServiceClient.post()
                .uri("/users")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(String.class)
                .block();

            String username = body.get("username");
            String token = jwtUtil.generateToken(username);
            return ResponseEntity.status(201).body(Map.of("token", token, "user", response));
        } catch (WebClientResponseException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ex.getResponseBodyAsString());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        if (username == null || username.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "username required"));
        }
        String token = jwtUtil.generateToken(username);
        return ResponseEntity.ok(Map.of("token", token));
    }
}
