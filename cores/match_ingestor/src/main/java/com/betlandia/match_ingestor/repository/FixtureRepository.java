package com.betlandia.match_ingestor.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.betlandia.match_ingestor.model.Fixture;
import com.betlandia.match_ingestor.model.FixtureStatus;

@Repository
public interface FixtureRepository extends JpaRepository<Fixture, UUID> {
    boolean existsByMatchId(Integer matchId);
    List<Fixture> findByStatus(FixtureStatus status);
    List<Fixture> findByStatusIn(List<FixtureStatus> statuses);
    Fixture findByMatchId(Integer matchId);

    @Modifying
    @Transactional
    @Query("UPDATE Fixture f SET f.status = :status WHERE f.matchId = :matchId")
    void updateStatus(@Param("matchId") Integer matchId, @Param("status") FixtureStatus status);
}