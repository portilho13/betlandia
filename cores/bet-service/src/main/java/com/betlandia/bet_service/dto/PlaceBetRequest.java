package com.betlandia.bet_service.dto;

import com.betlandia.bet_service.model.BetSelection;

import java.math.BigDecimal;
import java.util.UUID;

public record PlaceBetRequest(
    UUID userId,
    UUID marketId,
    BetSelection selection,
    BigDecimal stake,
    BigDecimal requestedOdds
) {}
