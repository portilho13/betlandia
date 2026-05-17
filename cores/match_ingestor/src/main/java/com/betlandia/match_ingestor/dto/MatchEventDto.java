package com.betlandia.match_ingestor.dto;

public record MatchEventDto(
    Integer matchId,
    String homeTeam,
    String awayTeam,
    Integer homeScore,
    Integer awayScore,
    String eventType
) {}
