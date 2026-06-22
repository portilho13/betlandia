package com.betlandia.odds_calculator.dto;

import java.time.Instant;

public record MatchStatusEvent(
    Integer matchId,
    String homeTeam,
    String awayTeam,
    String oldStatus,
    String newStatus,
    Integer homeScore,
    Integer awayScore,
    Instant changedAt
) {}
