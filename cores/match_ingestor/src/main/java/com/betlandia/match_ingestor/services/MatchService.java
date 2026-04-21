package com.betlandia.match_ingestor.services;

import java.time.Instant;
import java.util.ArrayList;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.config.YamlProcessor.MatchStatus;
import org.springframework.stereotype.Service;

import com.betlandia.match_ingestor.client.FootballApiClient;
import com.betlandia.match_ingestor.dto.external.FootballApiResponseDto;
import com.betlandia.match_ingestor.kafka.MatchProducer;
import com.betlandia.match_ingestor.model.Match;
import com.betlandia.match_ingestor.repository.MatchRepository;
import com.betlandia.match_ingestor.util.DateScheduler;
import com.betlandia.match_ingestor.util.Pair;

@Service
public class MatchService {

    private final DateScheduler dateScheduler;
    private final FootballApiClient footballApiClient;
    private final MatchRepository matchRepository;
    private final MatchProducer matchProducer;

    private static final Logger log = LoggerFactory.getLogger(MatchService.class);

    public MatchService(
        DateScheduler dateScheduler,
        FootballApiClient footballApiClient,
        MatchRepository matchRepository,
        MatchProducer matchProducer
    ) {
        this.dateScheduler = dateScheduler;
        this.footballApiClient = footballApiClient;
        this.matchRepository = matchRepository;
        this.matchProducer = matchProducer;
    }
    
    public void ingestFromApi() {

        ArrayList<Pair> dates = dateScheduler.getDateRange();

        Pair currentWeek = dates.get(0); // current week in idx 0
        Pair nextWeek = dates.get(1); // next week in idx 1

        log.info("Ingesting match for dates", currentWeek.toString(), nextWeek.toString());

        FootballApiResponseDto currentWeekDto = footballApiClient.fetchMatches(currentWeek.getFriday(), currentWeek.getMonday());
        FootballApiResponseDto nextWeekDto = footballApiClient.fetchMatches(nextWeek.getFriday(), nextWeek.getMonday());

        currentWeekDto.matches().forEach(matchDto -> {
            if (matchRepository.existsByMatchId(matchDto.id())) {
                log.info("Match {} already exists, skipping", matchDto.id());
                return;
            }

            Match match = new Match();
            match.setHomeTeam(matchDto.homeTeam().name());
            match.setAwayTeam(matchDto.awayTeam().name());

            Instant gameDate = Instant.parse(matchDto.utcDate());
            match.setGameDate(gameDate);
            match.setStatus(matchDto.status());
            match.setMatchId(matchDto.id());

            Match saved = matchRepository.save(match);

            matchProducer.sendMatch(saved);

            log.info("Saved match {} - {} vs {}", saved.getId(), saved.getHomeTeam(), saved.getAwayTeam());

        });

        nextWeekDto.matches().forEach(matchDto -> {
            if (matchRepository.existsByMatchId(matchDto.id())) {
                log.info("Match {} already exists, skipping", matchDto.id());
                return;
            }

            Match match = new Match();
            match.setHomeTeam(matchDto.homeTeam().name());
            match.setAwayTeam(matchDto.awayTeam().name());

            Instant gameDate = Instant.parse(matchDto.utcDate());
            match.setGameDate(gameDate);
            match.setStatus(matchDto.status());
            match.setMatchId(matchDto.id());

            Match saved = matchRepository.save(match);

            matchProducer.sendMatch(saved);

            log.info("Saved match {} - {} vs {}", saved.getId(), saved.getHomeTeam(), saved.getAwayTeam());

        });

    }
}
