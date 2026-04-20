package com.betlandia.match_ingestor.dto.external;

public record CompetitionDto(
    int id,
    String name,
    String code,
    String type,
    String emblem
) {}