package com.betlandia.bet_service.dto;

public record CreateUserRequest(
    String username,
    String email
) {}
