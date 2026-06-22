package com.betlandia.match_ingestor.dto.external;

public record TeamStatisticsDto(
    Integer corner_kicks,
    Integer free_kicks,
    Integer goal_kicks,
    Integer offsides,
    Integer fouls,
    Integer ball_possession,
    Integer saves,
    Integer throw_ins,
    Integer shots,
    Integer shots_on_goal,
    Integer shots_off_goal,
    Integer yellow_cards,
    Integer yellow_red_cards,
    Integer red_cards
) {}
