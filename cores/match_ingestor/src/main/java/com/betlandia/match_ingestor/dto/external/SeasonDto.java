package com.betlandia.match_ingestor.dto.external;

public record SeasonDto(
    Integer id,
    String startDate,
    String endDate,
    Integer currentMatchday
) {}
