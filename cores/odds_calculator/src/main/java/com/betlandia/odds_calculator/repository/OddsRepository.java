package com.betlandia.odds_calculator.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.betlandia.odds_calculator.model.MarketOdds;

public interface OddsRepository extends JpaRepository<MarketOdds, UUID> {
    boolean existsByFixtureId(int fixtureId);
}
