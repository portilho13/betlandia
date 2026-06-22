package com.betlandia.bet_service.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "bets")
public class Bet {

    @Id
    @GeneratedValue
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "market_id", nullable = false)
    private UUID marketId;

    @Enumerated(EnumType.STRING)
    @Column(name = "selection", nullable = false)
    private BetSelection selection;

    @Column(name = "odds_at_placement", nullable = false, precision = 5, scale = 2)
    private BigDecimal oddsAtPlacement;

    @Column(name = "stake", nullable = false, precision = 10, scale = 2)
    private BigDecimal stake;

    @Column(name = "potential_payout", nullable = false, precision = 10, scale = 2)
    private BigDecimal potentialPayout;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private BetStatus status = BetStatus.PENDING;

    @Column(name = "placed_at", nullable = false, updatable = false)
    private Instant placedAt;

    @PrePersist
    public void prePersist() {
        placedAt = Instant.now();
        if (status == null) status = BetStatus.PENDING;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public UUID getMarketId() { return marketId; }
    public void setMarketId(UUID marketId) { this.marketId = marketId; }

    public BetSelection getSelection() { return selection; }
    public void setSelection(BetSelection selection) { this.selection = selection; }

    public BigDecimal getOddsAtPlacement() { return oddsAtPlacement; }
    public void setOddsAtPlacement(BigDecimal oddsAtPlacement) { this.oddsAtPlacement = oddsAtPlacement; }

    public BigDecimal getStake() { return stake; }
    public void setStake(BigDecimal stake) { this.stake = stake; }

    public BigDecimal getPotentialPayout() { return potentialPayout; }
    public void setPotentialPayout(BigDecimal potentialPayout) { this.potentialPayout = potentialPayout; }

    public BetStatus getStatus() { return status; }
    public void setStatus(BetStatus status) { this.status = status; }

    public Instant getPlacedAt() { return placedAt; }
}
