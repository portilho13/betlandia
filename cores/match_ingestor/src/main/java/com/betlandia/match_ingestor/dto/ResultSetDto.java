package com.betlandia.match_ingestor.dto;

public record ResultSetDto(
    int count,
    String first,
    String last,
    int played
) {}
