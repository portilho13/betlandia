package com.betlandia.bet_service.service;

import com.betlandia.bet_service.dto.CreateUserRequest;
import com.betlandia.bet_service.model.User;
import com.betlandia.bet_service.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User createUser(CreateUserRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new IllegalArgumentException("Username already taken: " + request.username());
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already registered: " + request.email());
        }

        User user = new User();
        user.setUsername(request.username());
        user.setEmail(request.email());
        return userRepository.save(user);
    }

    public User getUser(UUID id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));
    }

    public java.util.List<User> listUsers() {
        return userRepository.findAll();
    }

    public User addBalance(java.util.UUID id, java.math.BigDecimal amount) {
        User user = getUser(id);
        user.setWalletBalance(user.getWalletBalance().add(amount));
        return userRepository.save(user);
    }
}
