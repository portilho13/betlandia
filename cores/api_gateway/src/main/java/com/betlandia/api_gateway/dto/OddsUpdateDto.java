package com.betlandia.api_gateway.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record OddsUpdateDto(
    Integer fixtureId,
    String homeTeam,
    String awayTeam,
    BigDecimal homeOdd,
    BigDecimal drawOdd,
    BigDecimal awayOdd,
    String marketType,
    Instant updatedAt
) {}
