package com.betlandia.match_ingestor.dto.external;

public record ResultSetDto(
    int count,
    String first,
    String last,
    int played
) {}
