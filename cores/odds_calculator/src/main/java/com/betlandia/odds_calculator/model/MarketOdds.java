package com.betlandia.odds_calculator.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "market_odds", schema = "public")
public class MarketOdds {

    @Id
    @GeneratedValue
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "fixture_id", nullable = false)
    private Integer fixtureId;

    @Enumerated(EnumType.STRING)
    @Column(name = "market_type", nullable = false)
    private OddsMarketType marketType;

    @Column(name = "home_odd", nullable = false, precision = 5, scale = 2)
    private BigDecimal homeOdd;

    @Column(name = "draw_odd", nullable = false, precision = 5, scale = 2)
    private BigDecimal drawOdd;

    @Column(name = "away_odd", nullable = false, precision = 5, scale = 2)
    private BigDecimal awayOdd;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }

    // Getters and Setters

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Integer getFixtureId() { return fixtureId; }
    public void setFixtureId(Integer fixtureId) { this.fixtureId = fixtureId; }

    public OddsMarketType getMarketType() { return marketType; }
    public void setMarketType(OddsMarketType marketType) { this.marketType = marketType; }

    public BigDecimal getHomeOdd() { return homeOdd; }
    public void setHomeOdd(BigDecimal homeOdd) { this.homeOdd = homeOdd; }

    public BigDecimal getDrawOdd() { return drawOdd; }
    public void setDrawOdd(BigDecimal drawOdd) { this.drawOdd = drawOdd; }

    public BigDecimal getAwayOdd() { return awayOdd; }
    public void setAwayOdd(BigDecimal awayOdd) { this.awayOdd = awayOdd; }

    public Instant getUpdatedAt() { return updatedAt; }
}