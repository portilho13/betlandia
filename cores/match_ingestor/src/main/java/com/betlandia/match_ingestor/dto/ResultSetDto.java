package com.betlandia.match_ingestor.dto;

public record ResultSetDto(
    Integer count,
    String first,
    String last,
    Integer played
) {}