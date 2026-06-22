package com.betlandia.odds_calculator.dto;

import java.util.List;
 
public class MatchDto {
    public AreaDto area;
    public CompetitionDto competition;
    public SeasonDto season;
    public Long id;
    public String utcDate;
    public String status;
    public Integer minute;
    public Integer injuryTime;
    public Integer attendance;
    public String venue;
    public Integer matchday;
    public String stage;
    public String group;
    public String lastUpdated;
    public MatchTeamDto homeTeam;
    public MatchTeamDto awayTeam;
    public ScoreDto score;
    public OddsDto odds;
    public List<RefereeDto> referees;
}