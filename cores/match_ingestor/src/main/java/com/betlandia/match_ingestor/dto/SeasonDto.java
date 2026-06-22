package com.betlandia.match_ingestor.dto;

public record SeasonDto(
    int id,
    String startDate,
    String endDate,
    int currentMatchday,
    String winner
) {}
