package com.betlandia.match_ingestor.service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.config.YamlProcessor.MatchStatus;
import org.springframework.stereotype.Service;

import com.betlandia.match_ingestor.client.FootballApiClient;
import com.betlandia.match_ingestor.client.MockFootballApiClient;
import com.betlandia.match_ingestor.dto.FootballApiResponseDto;
import com.betlandia.match_ingestor.dto.external.MatchDetailDto;
import com.betlandia.match_ingestor.kafka.FixtureProducer;
import com.betlandia.match_ingestor.model.Fixture;
import com.betlandia.match_ingestor.model.FixtureStatus;
import com.betlandia.match_ingestor.repository.FixtureRepository;
import com.betlandia.match_ingestor.util.Pair;

import jakarta.persistence.EntityNotFoundException;

// Needs Refactor

@Service
public class FixtureService {

    private final FootballApiClient footballApiClient;
    private final MockFootballApiClient mockFootballApiClient;

    private final FixtureRepository matchRepository;
    private final FixtureProducer matchProducer;

    private static final Logger log = LoggerFactory.getLogger(FixtureService.class);

    public FixtureService(
        FootballApiClient footballApiClient,
        MockFootballApiClient mockFootballApiClient,
        FixtureRepository matchRepository,
        FixtureProducer matchProducer
    ) {
        this.footballApiClient = footballApiClient;
        this.mockFootballApiClient = mockFootballApiClient;

        this.matchRepository = matchRepository;
        this.matchProducer = matchProducer;
    }
    
    public void fetchUpcommingMatches(Pair week) {

        log.info("Ingesting match for dates", week.toString(), week.toString());

        FootballApiResponseDto dto = footballApiClient.fetchMatches(week.getFriday(), week.getMonday());

        dto.matches().forEach(matchDto -> {
            if (matchRepository.existsByMatchId(matchDto.id())) {
                log.info("Match {} already exists, skipping", matchDto.id());
                return;
            }

            Fixture fixture = new Fixture();
            fixture.setHomeTeam(matchDto.homeTeam().name());
            fixture.setAwayTeam(matchDto.awayTeam().name());

            Instant gameDate = Instant.parse(matchDto.utcDate());
            fixture.setGameDate(gameDate);

            fixture.setStatus(FixtureStatus.fromString(matchDto.status()));
            fixture.setMatchId(matchDto.id());

            Fixture saved = matchRepository.save(fixture);

            matchProducer.sendTopic(saved, "fixture-registry");

            log.info("Saved match {} - {} vs {}", saved.getId(), saved.getHomeTeam(), saved.getAwayTeam());

        });
    }

    public void fetchLiveMatch(String matchId, boolean useMockClient) {

        Fixture match = matchRepository.findById(UUID.fromString(matchId))
    .orElseThrow(() -> new EntityNotFoundException("Fixture not found: " + matchId));

        MatchDetailDto dto;

        if (useMockClient) {
            dto = mockFootballApiClient.fetchMatchDetails(match.getMatchId());
        } else {
            dto = footballApiClient.fetchMatchDetails(match.getMatchId());
        }
    }
}
