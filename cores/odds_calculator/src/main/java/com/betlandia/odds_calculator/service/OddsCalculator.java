package com.betlandia.odds_calculator.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.betlandia.odds_calculator.dto.MatchDto;
import com.betlandia.odds_calculator.dto.OddsDto;

@Service
public class OddsCalculator {

    public OddsDto calculatePreMatchOdds(List<MatchDto> matches, int homeTeamId, int awayTeamId) {

        int totalMatches = matches.size();

        if (totalMatches == 0) {
            throw new IllegalArgumentException("No match data available");
        }

        // Home team stats
        int homeWins = calculateWins(matches, homeTeamId);
        int homeDraws = calculateDraws(matches);

        // Away team stats
        int awayWins = calculateWins(matches, awayTeamId);

        // Convert to probabilities
        float homeWinRate = (float) homeWins / totalMatches;
        float awayWinRate = (float) awayWins / totalMatches;
        float drawRate = (float) homeDraws / totalMatches; // shared

        // Combine strengths (very simple model)
        float homeStrength = homeWinRate;
        float awayStrength = awayWinRate;

        float totalStrength = homeStrength + awayStrength;

        if (totalStrength == 0) {
            totalStrength = 1; // fallback safety
        }

        float homeProb = homeStrength / totalStrength;
        float awayProb = awayStrength / totalStrength;

        // Blend in draw probability (basic weighting)
        drawRate = Math.max(0.1f, drawRate); // ensure minimum draw chance

        float remaining = 1 - drawRate;

        homeProb *= remaining;
        awayProb *= remaining;

        float totalProb = homeProb + drawRate + awayProb;

        homeProb /= totalProb;
        drawRate /= totalProb;
        awayProb /= totalProb;

        // Add bookmaker margin (5%)
        float margin = 1.05f;

        homeProb *= margin;
        drawRate *= margin;
        awayProb *= margin;

        // Convert to odds
        double homeOdds = 1 / Math.max(homeProb, 0.01f);
        double drawOdds = 1 / Math.max(drawRate, 0.01f);
        double awayOdds = 1 / Math.max(awayProb, 0.01f);

        OddsDto oddsDto = new OddsDto();
        oddsDto.homeWin = homeOdds;
        oddsDto.draw = drawOdds;
        oddsDto.awayWin = awayOdds;

        return oddsDto;
    }

    private int calculateWins(List<MatchDto> matches, int teamId) {
        int wins = 0;

        for (MatchDto match : matches) {
            if (match.homeTeam.id == teamId &&
                "HOME_TEAM".equals(match.score.winner)) {
                wins++;
            } else if (match.awayTeam.id == teamId &&
                "AWAY_TEAM".equals(match.score.winner)) {
                wins++;
            }
        }

        return wins;
    }

    private int calculateDraws(List<MatchDto> matches) {
        int draws = 0;

        for (MatchDto match : matches) {
            if ("DRAW".equals(match.score.winner)) {
                draws++;
            }
        }

        return draws;
    }
}