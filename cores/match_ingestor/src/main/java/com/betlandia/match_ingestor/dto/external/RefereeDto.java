package com.betlandia.match_ingestor.dto.external;

public record RefereeDto(
    int id,
    String name,
    String type,
    String nationality
) {}
