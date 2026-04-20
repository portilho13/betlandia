package com.betlandia.match_ingestor.dto.external;

public record TeamDto(
    int id,
    String name,
    String shortName,
    String tla,
    String crest
) {}
