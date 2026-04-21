package com.betlandia.match_ingestor.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.betlandia.match_ingestor.model.Match;

@Repository
public interface MatchRepository extends JpaRepository<Match, UUID> {
    boolean existsByMatchId(int matchId);
    List<Match> findByStatus(String status);
}
