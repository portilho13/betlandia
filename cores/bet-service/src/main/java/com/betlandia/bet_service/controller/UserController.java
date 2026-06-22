package com.betlandia.bet_service.controller;

import com.betlandia.bet_service.dto.CreateUserRequest;
import com.betlandia.bet_service.model.User;
import com.betlandia.bet_service.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public User createUser(@RequestBody CreateUserRequest request) {
        return userService.createUser(request);
    }

    @GetMapping("/{id}")
    public User getUser(@PathVariable UUID id) {
        return userService.getUser(id);
    }

    @GetMapping("/by-username/{username}")
    public User getUserByUsername(@PathVariable String username) {
        return userService.getUserByUsername(username);
    }

    @GetMapping
    public java.util.List<User> listUsers() {
        return userService.listUsers();
    }

    @PostMapping("/{id}/balance")
    public User addBalance(@PathVariable UUID id, @RequestBody java.util.Map<String, Object> body) {
        double amount = ((Number) body.get("amount")).doubleValue();
        return userService.addBalance(id, java.math.BigDecimal.valueOf(amount));
    }
}
