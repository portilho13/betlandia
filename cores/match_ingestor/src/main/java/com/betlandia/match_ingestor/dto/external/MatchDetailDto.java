package com.betlandia.match_ingestor.dto.external;

import java.util.List;

public record MatchDetailDto(
    Integer id,
    String utcDate,
    String status,
    Integer minute,
    Integer injuryTime,
    Integer attendance,
    String venue,
    Integer matchday,
    String stage,
    CompetitionDto competition,
    SeasonDto season,
    TeamDetailDto homeTeam,
    TeamDetailDto awayTeam,
    ScoreDto score,
    List<GoalDto> goals,
    List<BookingDto> bookings,
    List<SubstitutionDto> substitutions,
    List<PenaltyDto> penalties,
    OddsDto odds
) {}