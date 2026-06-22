package com.betlandia.match_ingestor.dto;

public record RefereeDto(
    int id,
    String name,
    String type,
    String nationality
) {}
