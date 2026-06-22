package com.betlandia.bet_service.repository;

import com.betlandia.bet_service.model.Bet;
import com.betlandia.bet_service.model.BetStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface BetRepository extends JpaRepository<Bet, UUID> {
    List<Bet> findByUserId(UUID userId);
    List<Bet> findByMarketId(UUID marketId);
    List<Bet> findByMarketIdAndStatus(UUID marketId, BetStatus status);

    @Query("SELECT b FROM Bet b WHERE b.marketId IN (SELECT m.id FROM Market m WHERE m.fixtureId = :fixtureId) AND b.status = :status")
    List<Bet> findByFixtureIdAndStatus(@Param("fixtureId") Integer fixtureId, @Param("status") BetStatus status);
}
