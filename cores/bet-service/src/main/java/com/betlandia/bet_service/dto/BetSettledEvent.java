package com.betlandia.bet_service.dto;

import java.math.BigDecimal;

public record BetSettledEvent(
    String betId,
    String userId,
    String status,
    BigDecimal payout
) {}
