package com.betlandia.match_ingestor.dto.external;

public record ScoreDto(
    String winner,
    String duration,
    HalfScoreDto fullTime,
    HalfScoreDto halfTime
) {}
