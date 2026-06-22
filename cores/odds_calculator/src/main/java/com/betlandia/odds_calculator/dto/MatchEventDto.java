package com.betlandia.odds_calculator.dto;

public record MatchEventDto(
    Integer matchId,
    String homeTeam,
    String awayTeam,
    Integer homeScore,
    Integer awayScore,
    String eventType
) {}

