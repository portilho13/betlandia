package com.betlandia.match_ingestor.dto.external;

public record GoalDto(
    Integer minute,
    Integer injuryTime,
    String type,
    TeamRefDto team,
    PlayerRefDto scorer,
    PlayerRefDto assist,
    HalfScoreDto score
) {}
