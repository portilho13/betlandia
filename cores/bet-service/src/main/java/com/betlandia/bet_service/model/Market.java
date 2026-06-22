package com.betlandia.bet_service.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "markets")
public class Market {

    @Id
    @GeneratedValue
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "fixture_id", nullable = false)
    private Integer fixtureId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private MarketType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private MarketStatus status = MarketStatus.OPEN;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = Instant.now();
        if (status == null) status = MarketStatus.OPEN;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Integer getFixtureId() { return fixtureId; }
    public void setFixtureId(Integer fixtureId) { this.fixtureId = fixtureId; }

    public MarketType getType() { return type; }
    public void setType(MarketType type) { this.type = type; }

    public MarketStatus getStatus() { return status; }
    public void setStatus(MarketStatus status) { this.status = status; }

    public Instant getCreatedAt() { return createdAt; }
}
