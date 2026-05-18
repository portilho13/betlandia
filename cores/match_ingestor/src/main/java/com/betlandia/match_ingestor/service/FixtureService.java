package com.betlandia.match_ingestor.service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.config.YamlProcessor.MatchStatus;
import org.springframework.stereotype.Service;

import com.betlandia.match_ingestor.client.FootballApiClient;
import com.betlandia.match_ingestor.client.MockApiClient;
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
    private final MockApiClient mockApiClient;

    private final FixtureRepository matchRepository;
    private final FixtureProducer matchProducer;

    private static final Logger log = LoggerFactory.getLogger(FixtureService.class);

    public FixtureService(
        FootballApiClient footballApiClient,
        MockApiClient mockApiClient,
        FixtureRepository matchRepository,
        FixtureProducer matchProducer
    ) {
        this.footballApiClient = footballApiClient;
        this.mockApiClient = mockApiClient;
        
        this.matchRepository = matchRepository;
        this.matchProducer = matchProducer;
    }
    
    public void fetchUpcommingMatches(Pair week, boolean useMockApi) {

        log.info("Ingesting match for dates: {} to {}", week.getFriday(), week.getMonday());

        FootballApiResponseDto dto;

        if (useMockApi) {
            dto = mockApiClient.fetchMatches(week.getFriday(), week.getMonday());
        } else {
            dto = footballApiClient.fetchMatches(week.getFriday(), week.getMonday());
        }

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

        MatchDetailDto dto = footballApiClient.fetchMatchDetails(match.getMatchId());

    }

    public void startMatches(boolean useMockApi) {
        List<Fixture> fixtures = matchRepository.findByStatus(FixtureStatus.SCHEDULED);
        for (Fixture match : fixtures) {
            try {
                MatchDetailDto dto;

                if (useMockApi) {
                    dto = mockApiClient.fetchMatchDetails(match.getMatchId());
                } else {
                    dto = footballApiClient.fetchMatchDetails(match.getMatchId());
                }

                if ("IN_PLAY".equals(dto.status())) {
                    matchRepository.updateStatus(match.getMatchId(), FixtureStatus.IN_PLAY);
                    log.info("Match {} is now IN_PLAY", match.getMatchId());
                }

            } catch (Exception e) {
                if(Instant.now().isAfter(match.getGameDate())) {
                    matchRepository.updateStatus(match.getMatchId(), FixtureStatus.IN_PLAY);
                }
            }
        }
    }

    public void fetchGameEvents() {
        List<Fixture> fixtures = matchRepository.findByStatus(FixtureStatus.IN_PLAY);

        for(Fixture match: fixtures) {
            try {
                MatchDetailDto dto = footballApiClient.fetchMatchDetails(match.getMatchId());

                int newHomeScore = dto.score().fullTime().home();
                int newAwayScore = dto.score().fullTime().away();

                boolean homeScored = newHomeScore > match.getHomeScore();
                boolean awayScored = newAwayScore > match.getAwayScore();

                if (homeScored || awayScored) {

                    matchProducer.sendMatchEvent(match, newHomeScore, newAwayScore);

                    match.setHomeScore(newHomeScore);
                    match.setAwayScore(newAwayScore);
                    matchRepository.save(match);

                    log.info("Goal detected! Match {} score: {} - {}", 
                        match.getMatchId(), newHomeScore, newAwayScore);
                }

            } catch (Exception e) {
                log.error(e.toString());
            }
        }
    }
}
