package com.betlandia.bet_service.repository;

import com.betlandia.bet_service.model.Market;
import com.betlandia.bet_service.model.MarketStatus;
import com.betlandia.bet_service.model.MarketType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MarketRepository extends JpaRepository<Market, UUID> {
    List<Market> findByFixtureId(Integer fixtureId);
    Optional<Market> findByFixtureIdAndType(Integer fixtureId, MarketType type);
    boolean existsByFixtureIdAndType(Integer fixtureId, MarketType type);

    @Modifying
    @Query("UPDATE Market m SET m.status = :status WHERE m.fixtureId = :fixtureId")
    void updateStatusForFixture(@Param("fixtureId") Integer fixtureId, @Param("status") MarketStatus status);
}
