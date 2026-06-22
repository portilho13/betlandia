package com.betlandia.match_ingestor.dto;

public record TeamDto(
    int id,
    String name,
    String shortName,
    String tla,
    String crest
) {}
