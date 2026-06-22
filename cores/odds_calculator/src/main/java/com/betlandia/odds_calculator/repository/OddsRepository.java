package com.betlandia.odds_calculator.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.betlandia.odds_calculator.model.MarketOdds;
import com.betlandia.odds_calculator.model.OddsMarketType;

public interface OddsRepository extends JpaRepository<MarketOdds, UUID> {
    boolean existsByFixtureId(int fixtureId);
    List<MarketOdds> findByFixtureId(Integer fixtureId);
    Optional<MarketOdds> findByFixtureIdAndMarketType(Integer fixtureId, OddsMarketType marketType);
}
