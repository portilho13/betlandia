package com.betlandia.match_ingestor.dto.external;

import java.util.List;

public record MatchDto(
    AreaDto area,
    CompetitionDto competition,
    SeasonDto season,
    int id,
    String utcDate,
    String status,
    int matchday,
    String stage,
    String group,
    String lastUpdated,
    TeamDto homeTeam,
    TeamDto awayTeam,
    ScoreDto score,
    List<RefereeDto> referees
) {}