package com.betlandia.odds_calculator.dto;

import java.util.List;

public class MatchHeadToHeadResponseDto {
    public FiltersDto filters;
    public ResultSetDto resultSet;
    public AggregatesDto aggregates;
    public List<MatchDto> matches;
}