package com.betlandia.match_ingestor.dto.external;

public record CompetitionDto(
    Integer id,
    String name,
    String code,
    String type
) {}
