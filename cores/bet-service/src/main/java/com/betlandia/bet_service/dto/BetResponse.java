package com.betlandia.bet_service.dto;

import com.betlandia.bet_service.model.BetSelection;
import com.betlandia.bet_service.model.BetStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record BetResponse(
    UUID id,
    UUID userId,
    UUID marketId,
    BetSelection selection,
    BigDecimal oddsAtPlacement,
    BigDecimal stake,
    BigDecimal potentialPayout,
    BetStatus status,
    Instant placedAt
) {}
