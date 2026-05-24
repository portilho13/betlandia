package com.betlandia.odds_calculator.service;

import java.math.BigDecimal;
import java.math.RoundingMode;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.betlandia.odds_calculator.client.OddsApiClient;
import com.betlandia.odds_calculator.dto.MatchEventDto;
import com.betlandia.odds_calculator.dto.MatchHeadToHeadResponseDto;
import com.betlandia.odds_calculator.dto.OddsDto;
import com.betlandia.odds_calculator.kafka.OddsProducer;
import com.betlandia.odds_calculator.model.MarketOdds;
import com.betlandia.odds_calculator.model.OddsMarketType;
import com.betlandia.odds_calculator.repository.OddsRepository;

@Service
public class OddsService {
    private final OddsCalculator oddsCalculator;
    private static final Logger log = LoggerFactory.getLogger(OddsService.class);
    private final OddsApiClient oddsApiClient;
    private final OddsRepository oddsRepository;
    private final OddsProducer oddsProducer;


    // Assumptions

    private static final double AVG_GOALS_PER_TEAM = 1.35;
    private static final double BOOKMAKER_MARGIN = 1.05;
    private static final double MAX_GOALS = 10; // Poisson sum upper bound


    public OddsService(
        OddsCalculator oddsCalculator,
        OddsApiClient oddsApiClient,
        OddsRepository oddsRepository,
        OddsProducer oddsProducer
    ) {
        this.oddsCalculator = oddsCalculator;
        this.oddsApiClient = oddsApiClient;
        this.oddsRepository = oddsRepository;
        this.oddsProducer = oddsProducer;
    }

    public void populatePreMatchOdds(Integer matchId) {

        MatchHeadToHeadResponseDto dto = oddsApiClient.fetchHeadToHeadMatches(matchId.toString());

        int homeTeamId = dto.aggregates.homeTeam.id;
        int awayTeamId = dto.aggregates.awayTeam.id;

        OddsDto oddsDto = oddsCalculator.calculatePreMatchOdds(dto.matches, homeTeamId, awayTeamId);

        MarketOdds marketOdd = new MarketOdds();

        BigDecimal homeWinOdd = BigDecimal.valueOf(oddsDto.homeWin).setScale(2, RoundingMode.HALF_UP);
        BigDecimal drawOdd    = BigDecimal.valueOf(oddsDto.draw).setScale(2, RoundingMode.HALF_UP);
        BigDecimal awayOdd    = BigDecimal.valueOf(oddsDto.awayWin).setScale(2, RoundingMode.HALF_UP);


        marketOdd.setFixtureId(matchId);
        marketOdd.setMarketType(OddsMarketType.MATCH_WINNER);

        marketOdd.setHomeOdd(homeWinOdd);
        marketOdd.setDrawOdd(drawOdd);
        marketOdd.setAwayOdd(awayOdd);

        if (!oddsRepository.existsByFixtureId(matchId)) {
            MarketOdds saved = oddsRepository.save(marketOdd);

            oddsProducer.sendTopic(saved, "odds-updates");

        }
    }

    public void recalculateOdds(MatchEventDto dto) {
        switch (dto.eventType().toUpperCase()) {
            case "GOAL":
                calculateFromScore(dto);
                break;
        
            default:
                break;
        }

    }

    private void calculateFromScore(MatchEventDto dto) {
        log.info("RECALCULATING ODDS");
        int homeScore = dto.homeScore();
        int awayScore = dto.awayScore();

        int diff = homeScore - awayScore;
        double homeLambda = adjustedLambda(AVG_GOALS_PER_TEAM, -diff); // losing team gets boost
        double awayLambda = adjustedLambda(AVG_GOALS_PER_TEAM,  diff);

        double pHome = 0, pDraw = 0, pAway = 0;

        for (int h = 0; h <= MAX_GOALS; h++) {
            for (int a = 0; a <= MAX_GOALS; a++) {
                double p = poisson(homeLambda, h) * poisson(awayLambda, a);
                int finalHome = homeScore + h;
                int finalAway = awayScore + a;

                if      (finalHome > finalAway) pHome += p;
                else if (finalHome == finalAway) pDraw += p;
                else                             pAway += p;
            }
        }

        double total = pHome + pDraw + pAway;
        pHome /= total;
        pDraw /= total;
        pAway /= total;

        MarketOdds odds = oddsRepository
            .findByFixtureIdAndMarketType(dto.matchId(), OddsMarketType.MATCH_WINNER)
            .orElseThrow(() -> new IllegalStateException(
                "No pre-match odds found for fixtureId: " + dto.matchId()
            ));

        odds.setHomeOdd(toDecimalOdds(pHome));
        odds.setDrawOdd(toDecimalOdds(pDraw));
        odds.setAwayOdd(toDecimalOdds(pAway));

        MarketOdds saved = oddsRepository.save(odds);
        oddsProducer.sendTopic(saved, "odds-updates");

    }

    private double adjustedLambda(double base, int scoreDiff) {
        if (scoreDiff < 0) return base * 1.10; // losing: +10%
        if (scoreDiff > 0) return base * 0.92; // winning: -8%
        return base;
    }

    private double poisson(double lambda, int k) {
        if (lambda <= 0) return k == 0 ? 1.0 : 0.0;
        double p = Math.exp(-lambda);
        for (int i = 1; i <= k; i++) {
            p *= lambda / i;
        }
        return p;
    }

    private BigDecimal toDecimalOdds(double probability) {
        double odds = (1.0 / probability) * BOOKMAKER_MARGIN;
        return BigDecimal.valueOf(odds).setScale(2, RoundingMode.HALF_UP);
    }
}
