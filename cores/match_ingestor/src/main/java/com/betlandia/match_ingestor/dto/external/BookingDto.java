package com.betlandia.match_ingestor.dto.external;

public record BookingDto(
    Integer minute,
    TeamRefDto team,
    PlayerRefDto player,
    String card
) {}
