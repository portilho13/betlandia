package com.betlandia.odds_calculator.service;

import java.math.BigDecimal;
import java.math.RoundingMode;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.betlandia.odds_calculator.client.OddsApiClient;
import com.betlandia.odds_calculator.dto.MatchHeadToHeadResponseDto;
import com.betlandia.odds_calculator.dto.OddsDto;
import com.betlandia.odds_calculator.model.MarketOdds;
import com.betlandia.odds_calculator.model.OddsMarketType;
import com.betlandia.odds_calculator.repository.OddsRepository;

@Service
public class OddsService {
    private final OddsCalculator oddsCalculator;
    private static final Logger log = LoggerFactory.getLogger(OddsService.class);
    private final OddsApiClient oddsApiClient;
    private final OddsRepository oddsRepository;


    public OddsService(
        OddsCalculator oddsCalculator,
        OddsApiClient oddsApiClient,
        OddsRepository oddsRepository
    ) {
        this.oddsCalculator = oddsCalculator;
        this.oddsApiClient = oddsApiClient;
        this.oddsRepository = oddsRepository;
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

        MarketOdds saved = oddsRepository.save(marketOdd);
        
        log.info("Home Team Odds: {} Draw Odd: {} Away Team Odd: {}", oddsDto.homeWin, oddsDto.draw, oddsDto.awayWin);

    }
}
