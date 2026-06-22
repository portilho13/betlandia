package com.betlandia.odds_calculator.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import com.betlandia.odds_calculator.client.OddsApiClient;
import com.betlandia.odds_calculator.dto.BetPlacedEvent;
import com.betlandia.odds_calculator.dto.MatchEventDto;
import com.betlandia.odds_calculator.dto.MatchHeadToHeadResponseDto;
import com.betlandia.odds_calculator.dto.MatchStatusEvent;
import com.betlandia.odds_calculator.dto.OddsDto;
import com.betlandia.odds_calculator.dto.OddsUpdateDto;
import com.betlandia.odds_calculator.kafka.OddsProducer;
import com.betlandia.odds_calculator.model.Fixture;
import com.betlandia.odds_calculator.model.MarketOdds;
import com.betlandia.odds_calculator.model.OddsMarketType;
import com.betlandia.odds_calculator.repository.OddsRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class OddsService {
    private static final Logger log = LoggerFactory.getLogger(OddsService.class);

    private static final double AVG_GOALS_PER_TEAM = 1.35;
    private static final double BOOKMAKER_MARGIN = 1.05;
    private static final double MAX_GOALS = 10;
    private static final double BET_VOLUME_SCALE = 500.0;
    private static final double MAX_VOLUME_ADJUSTMENT = 0.03;

    private final OddsCalculator oddsCalculator;
    private final OddsApiClient oddsApiClient;
    private final OddsRepository oddsRepository;
    private final OddsProducer oddsProducer;
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    public OddsService(
        OddsCalculator oddsCalculator,
        OddsApiClient oddsApiClient,
        OddsRepository oddsRepository,
        OddsProducer oddsProducer,
        StringRedisTemplate redisTemplate,
        ObjectMapper objectMapper
    ) {
        this.oddsCalculator = oddsCalculator;
        this.oddsApiClient = oddsApiClient;
        this.oddsRepository = oddsRepository;
        this.oddsProducer = oddsProducer;
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    public void populatePreMatchOdds(Fixture fixture) {
        Integer matchId = fixture.getMatchId();

        if (oddsRepository.existsByFixtureId(matchId)) {
            log.info("Odds already exist for fixture {}, skipping", matchId);
            return;
        }

        MatchHeadToHeadResponseDto dto = oddsApiClient.fetchHeadToHeadMatches(matchId.toString());

        int homeTeamId = dto.aggregates.homeTeam.id;
        int awayTeamId = dto.aggregates.awayTeam.id;

        OddsDto oddsDto = oddsCalculator.calculatePreMatchOdds(dto.matches, homeTeamId, awayTeamId);

        MarketOdds marketOdd = new MarketOdds();
        marketOdd.setFixtureId(matchId);
        marketOdd.setMarketType(OddsMarketType.MATCH_WINNER);
        marketOdd.setHomeOdd(BigDecimal.valueOf(oddsDto.homeWin).setScale(2, RoundingMode.HALF_UP));
        marketOdd.setDrawOdd(BigDecimal.valueOf(oddsDto.draw).setScale(2, RoundingMode.HALF_UP));
        marketOdd.setAwayOdd(BigDecimal.valueOf(oddsDto.awayWin).setScale(2, RoundingMode.HALF_UP));

        MarketOdds saved = oddsRepository.save(marketOdd);

        OddsUpdateDto update = toUpdateDto(saved, fixture.getHomeTeam(), fixture.getAwayTeam());
        publishAndCache(update);
    }

    public void recalculateOdds(MatchEventDto dto) {
        if ("GOAL".equalsIgnoreCase(dto.eventType())) {
            recalculateFromScore(dto);
        }
    }

    public void handleMatchStatus(MatchStatusEvent event) {
        String newStatus = event.newStatus();

        if ("IN_PLAY".equals(newStatus)) {
            oddsRepository.findByFixtureIdAndMarketType(event.matchId(), OddsMarketType.MATCH_WINNER)
                .ifPresent(odds -> {
                    OddsUpdateDto update = toUpdateDto(odds, event.homeTeam(), event.awayTeam());
                    publishAndCache(update);
                    log.info("Published live odds on IN_PLAY for fixture {}", event.matchId());
                });
        } else if ("FINISHED".equals(newStatus) || "CANCELLED".equals(newStatus) || "POSTPONED".equals(newStatus)) {
            log.info("Fixture {} is {}, stopping odds processing", event.matchId(), newStatus);
        }
    }

    public void adjustForBetVolume(BetPlacedEvent event) {
        oddsRepository.findByFixtureIdAndMarketType(event.fixtureId(), OddsMarketType.MATCH_WINNER)
            .ifPresent(odds -> {
                double factor = Math.min(MAX_VOLUME_ADJUSTMENT, event.stake().doubleValue() / BET_VOLUME_SCALE);

                switch (event.selection().toUpperCase()) {
                    case "HOME" -> odds.setHomeOdd(shorten(odds.getHomeOdd(), factor));
                    case "AWAY" -> odds.setAwayOdd(shorten(odds.getAwayOdd(), factor));
                    case "DRAW" -> odds.setDrawOdd(shorten(odds.getDrawOdd(), factor));
                }

                MarketOdds saved = oddsRepository.save(odds);
                OddsUpdateDto update = toUpdateDto(saved, null, null);
                publishAndCache(update);

                log.info("Adjusted odds for fixture {} after bet on {}", event.fixtureId(), event.selection());
            });
    }

    private void recalculateFromScore(MatchEventDto dto) {
        int homeScore = dto.homeScore();
        int awayScore = dto.awayScore();
        int diff = homeScore - awayScore;

        double homeLambda = adjustedLambda(AVG_GOALS_PER_TEAM, -diff);
        double awayLambda = adjustedLambda(AVG_GOALS_PER_TEAM, diff);

        double pHome = 0, pDraw = 0, pAway = 0;
        for (int h = 0; h <= MAX_GOALS; h++) {
            for (int a = 0; a <= MAX_GOALS; a++) {
                double p = poisson(homeLambda, h) * poisson(awayLambda, a);
                int fh = homeScore + h;
                int fa = awayScore + a;
                if      (fh > fa) pHome += p;
                else if (fh == fa) pDraw += p;
                else               pAway += p;
            }
        }

        double total = pHome + pDraw + pAway;
        pHome /= total;
        pDraw /= total;
        pAway /= total;

        MarketOdds odds = oddsRepository
            .findByFixtureIdAndMarketType(dto.matchId(), OddsMarketType.MATCH_WINNER)
            .orElseThrow(() -> new IllegalStateException("No odds for fixture: " + dto.matchId()));

        odds.setHomeOdd(toDecimalOdds(pHome));
        odds.setDrawOdd(toDecimalOdds(pDraw));
        odds.setAwayOdd(toDecimalOdds(pAway));

        MarketOdds saved = oddsRepository.save(odds);
        OddsUpdateDto update = toUpdateDto(saved, dto.homeTeam(), dto.awayTeam());
        publishAndCache(update);
    }

    private void publishAndCache(OddsUpdateDto update) {
        oddsProducer.sendOddsUpdate(update);
        String redisKey = "odds:" + update.fixtureId() + ":" + update.marketType();
        try {
            redisTemplate.opsForValue().set(redisKey, objectMapper.writeValueAsString(update));
        } catch (JsonProcessingException e) {
            log.error("Failed to cache odds for key {}", redisKey, e);
        }
    }

    private OddsUpdateDto toUpdateDto(MarketOdds odds, String homeTeam, String awayTeam) {
        return new OddsUpdateDto(
            odds.getFixtureId(),
            homeTeam,
            awayTeam,
            odds.getHomeOdd(),
            odds.getDrawOdd(),
            odds.getAwayOdd(),
            odds.getMarketType().name(),
            Instant.now()
        );
    }

    private BigDecimal shorten(BigDecimal odd, double factor) {
        return odd.multiply(BigDecimal.valueOf(1.0 - factor)).setScale(2, RoundingMode.HALF_UP);
    }

    private double adjustedLambda(double base, int scoreDiff) {
        if (scoreDiff < 0) return base * 1.10;
        if (scoreDiff > 0) return base * 0.92;
        return base;
    }

    private double poisson(double lambda, int k) {
        if (lambda <= 0) return k == 0 ? 1.0 : 0.0;
        double p = Math.exp(-lambda);
        for (int i = 1; i <= k; i++) p *= lambda / i;
        return p;
    }

    private BigDecimal toDecimalOdds(double probability) {
        double odds = (1.0 / probability) * BOOKMAKER_MARGIN;
        return BigDecimal.valueOf(odds).setScale(2, RoundingMode.HALF_UP);
    }
}
