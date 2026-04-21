package com.betlandia.match_ingestor.dto.external;

import java.util.List;
import java.util.Map;

public record FootballApiResponseDto(
    Map<String, String> filters,
    ResultSetDto resultSet,
    CompetitionDto competition,
    List<MatchDto> matches
) {}
