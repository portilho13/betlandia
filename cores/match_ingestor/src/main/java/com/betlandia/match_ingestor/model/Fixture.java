package com.betlandia.match_ingestor.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "fixtures")
public class Fixture {

    @Id
    @GeneratedValue
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "home_team", length = 255)
    private String homeTeam;

    @Column(name = "away_team", length = 255)
    private String awayTeam;

    @Column(name = "game_date")
    private Instant gameDate;

    @Column(name = "home_odd", precision = 5, scale = 2)
    private BigDecimal homeOdd;

    @Column(name = "away_odd", precision = 5, scale = 2)
    private BigDecimal awayOdd;

    @Column(name = "half_odd", precision = 5, scale = 2)
    private BigDecimal halfOdd;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "status", length = 255)
    private String status;

    @Column(name = "home_score")
    private Integer homeScore;

    @Column(name = "away_score")
    private Integer awayScore;

    @Column(name = "match_id")
    private Integer matchId;

    // Getters and Setters

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getHomeTeam() {
        return homeTeam;
    }

    public void setHomeTeam(String homeTeam) {
        this.homeTeam = homeTeam;
    }

    public String getAwayTeam() {
        return awayTeam;
    }

    public void setAwayTeam(String awayTeam) {
        this.awayTeam = awayTeam;
    }

    public Instant getGameDate() {
        return gameDate;
    }

    public void setGameDate(Instant gameDate) {
        this.gameDate = gameDate;
    }

    public BigDecimal getHomeOdd() {
        return homeOdd;
    }

    public void setHomeOdd(BigDecimal homeOdd) {
        this.homeOdd = homeOdd;
    }

    public BigDecimal getAwayOdd() {
        return awayOdd;
    }

    public void setAwayOdd(BigDecimal awayOdd) {
        this.awayOdd = awayOdd;
    }

    public BigDecimal getHalfOdd() {
        return halfOdd;
    }

    public void setHalfOdd(BigDecimal halfOdd) {
        this.halfOdd = halfOdd;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getHomeScore() {
        return homeScore;
    }

    public void setHomeScore(Integer homeScore) {
        this.homeScore = homeScore;
    }

    public Integer getAwayScore() {
        return awayScore;
    }

    public void setAwayScore(Integer awayScore) {
        this.awayScore = awayScore;
    }

    public Integer getMatchId() {
        return matchId;
    }

    public void setMatchId(Integer matchId) {
        this.matchId = matchId;
    }
}