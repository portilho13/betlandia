package com.betlandia.odds_calculator.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.betlandia.odds_calculator.client.OddsApiClient;
import com.betlandia.odds_calculator.dto.MatchHeadToHeadResponseDto;
import com.betlandia.odds_calculator.dto.OddsDto;

@Service
public class OddsService {
    private final OddsCalculator oddsCalculator;
    private static final Logger log = LoggerFactory.getLogger(OddsService.class);
    private final OddsApiClient oddsApiClient;


    public OddsService(
        OddsCalculator oddsCalculator,
        OddsApiClient oddsApiClient
    ) {
        this.oddsCalculator = oddsCalculator;
        this.oddsApiClient = oddsApiClient;
    }

    public void populatePreMatchOdds() {

        MatchHeadToHeadResponseDto dto = oddsApiClient.fetchHeadToHeadMatches();

        int homeTeamId = dto.aggregates.homeTeam.id;
        int awayTeamId = dto.aggregates.awayTeam.id;

        OddsDto oddsDto = oddsCalculator.calculatePreMatchOdds(dto.matches, homeTeamId, awayTeamId);
        
        log.info("Home Team Odds: {} Draw Odd: {} Away Team Odd: {}", oddsDto.homeWin, oddsDto.draw, oddsDto.awayWin);

    }
}
