package com.betlandia.match_ingestor.dto.external;

public record PlayerDto(
    Integer id,
    String name,
    String position,
    Integer shirtNumber
) {}