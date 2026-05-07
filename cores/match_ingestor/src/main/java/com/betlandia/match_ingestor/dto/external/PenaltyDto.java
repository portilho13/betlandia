package com.betlandia.match_ingestor.dto.external;

public record PenaltyDto(
    Integer minute,
    TeamRefDto team,
    PlayerRefDto player,
    Boolean scored
) {}
