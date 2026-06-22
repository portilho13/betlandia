package com.betlandia.bet_service.dto;

import java.math.BigDecimal;

public record BetPlacedEvent(
    String betId,
    Integer fixtureId,
    String marketId,
    String userId,
    String selection,
    BigDecimal oddsAtPlacement,
    BigDecimal stake
) {}
