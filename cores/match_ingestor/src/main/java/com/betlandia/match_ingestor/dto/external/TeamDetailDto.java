package com.betlandia.match_ingestor.dto.external;

import java.util.List;

public record TeamDetailDto(
    Integer id,
    String name,
    String shortName,
    String tla,
    String formation,
    List<PlayerDto> lineup,
    List<PlayerDto> bench,
    TeamStatisticsDto statistics
) {}
