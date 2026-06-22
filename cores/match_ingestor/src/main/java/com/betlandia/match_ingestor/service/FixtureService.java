package com.betlandia.match_ingestor.service;

import java.time.Instant;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

@Service
public class FixtureService {

    private static final Logger log = LoggerFactory.getLogger(FixtureService.class);

    private final FootballApiClient footballApiClient;
    private final MockApiClient mockApiClient;
    private final FixtureRepository matchRepository;
    private final FixtureProducer matchProducer;

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
        log.info("Ingesting matches for dates: {} to {}", week.getFriday(), week.getMonday());

        FootballApiResponseDto dto = useMockApi
            ? mockApiClient.fetchMatches(week.getFriday(), week.getMonday())
            : footballApiClient.fetchMatches(week.getFriday(), week.getMonday());

        dto.matches().forEach(matchDto -> {
            if (matchRepository.existsByMatchId(matchDto.id())) {
                return;
            }

            Fixture fixture = new Fixture();
            fixture.setHomeTeam(matchDto.homeTeam().name());
            fixture.setAwayTeam(matchDto.awayTeam().name());
            fixture.setGameDate(Instant.parse(matchDto.utcDate()));
            fixture.setStatus(FixtureStatus.fromString(matchDto.status()));
            fixture.setMatchId(matchDto.id());

            Fixture saved = matchRepository.save(fixture);
            matchProducer.sendTopic(saved, "fixture-registry");

            log.info("Saved fixture {} - {} vs {}", saved.getId(), saved.getHomeTeam(), saved.getAwayTeam());
        });
    }

    public void startMatches(boolean useMockApi) {
        List<Fixture> fixtures = matchRepository.findByStatus(FixtureStatus.SCHEDULED);

        for (Fixture match : fixtures) {
            try {
                MatchDetailDto dto = useMockApi
                    ? mockApiClient.fetchMatchDetails(match.getMatchId())
                    : footballApiClient.fetchMatchDetails(match.getMatchId());

                FixtureStatus newStatus = FixtureStatus.fromString(dto.status());

                if (newStatus != match.getStatus()) {
                    FixtureStatus oldStatus = match.getStatus();
                    matchRepository.updateStatus(match.getMatchId(), newStatus);
                    match.setStatus(newStatus);
                    matchProducer.sendMatchStatusEvent(match, oldStatus, newStatus);
                    log.info("Match {} status: {} → {}", match.getMatchId(), oldStatus, newStatus);
                }

            } catch (Exception e) {
                if (Instant.now().isAfter(match.getGameDate())) {
                    FixtureStatus oldStatus = match.getStatus();
                    matchRepository.updateStatus(match.getMatchId(), FixtureStatus.IN_PLAY);
                    match.setStatus(FixtureStatus.IN_PLAY);
                    matchProducer.sendMatchStatusEvent(match, oldStatus, FixtureStatus.IN_PLAY);
                }
            }
        }
    }

    public void fetchGameEvents(boolean useMockApi) {
        List<Fixture> fixtures = matchRepository.findByStatusIn(
            List.of(FixtureStatus.IN_PLAY, FixtureStatus.PAUSED)
        );

        if (fixtures.isEmpty()) {
            return;
        }

        for (Fixture match : fixtures) {
            try {
                MatchDetailDto dto = useMockApi
                    ? mockApiClient.fetchMatchDetails(match.getMatchId())
                    : footballApiClient.fetchMatchDetails(match.getMatchId());

                int newHomeScore = dto.score().fullTime().home() != null ? dto.score().fullTime().home() : 0;
                int newAwayScore = dto.score().fullTime().away() != null ? dto.score().fullTime().away() : 0;

                int storedHome = match.getHomeScore() != null ? match.getHomeScore() : 0;
                int storedAway = match.getAwayScore() != null ? match.getAwayScore() : 0;

                if (newHomeScore > storedHome || newAwayScore > storedAway) {
                    matchProducer.sendMatchEvent(match, newHomeScore, newAwayScore);
                    match.setHomeScore(newHomeScore);
                    match.setAwayScore(newAwayScore);
                    matchRepository.save(match);
                    log.info("Goal detected! Match {} score: {} - {}", match.getMatchId(), newHomeScore, newAwayScore);
                }

                FixtureStatus apiStatus = FixtureStatus.fromString(dto.status());
                if (apiStatus != match.getStatus()) {
                    FixtureStatus oldStatus = match.getStatus();
                    matchRepository.updateStatus(match.getMatchId(), apiStatus);
                    match.setStatus(apiStatus);
                    matchProducer.sendMatchStatusEvent(match, oldStatus, apiStatus);
                    log.info("Match {} status changed: {} → {}", match.getMatchId(), oldStatus, apiStatus);
                }

            } catch (Exception e) {
                log.error("Error polling match {}: {}", match.getMatchId(), e.getMessage());
            }
        }
    }
}
