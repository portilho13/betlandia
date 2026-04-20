package com.betlandia.match_ingestor.dto.external;

public record ScoreDto(
    String winner,
    String duration,
    ScoreDetailDto fullTime,
    ScoreDetailDto halfTime,
    ScoreDetailDto regularTime,
    ScoreDetailDto extraTime,
    ScoreDetailDto penalties
) {}
