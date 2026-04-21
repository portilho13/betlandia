package com.betlandia.match_ingestor.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.betlandia.match_ingestor.model.Fixture;

@Repository
public interface FixtureRepository extends JpaRepository<Fixture, UUID> {
    boolean existsByMatchId(int matchId);
    List<Fixture> findByStatus(String status);
}
