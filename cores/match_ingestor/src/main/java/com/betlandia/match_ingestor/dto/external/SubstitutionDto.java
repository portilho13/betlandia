package com.betlandia.match_ingestor.dto.external;

public record SubstitutionDto(
    Integer minute,
    TeamRefDto team,
    PlayerRefDto playerOut,
    PlayerRefDto playerIn
) {}