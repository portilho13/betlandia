package com.betlandia.odds_calculator.dto;

import java.util.List;
 
public class SeasonDto {
    public Integer id;
    public String startDate;
    public String endDate;
    public Integer currentMatchday;
    public SeasonWinnerDto winner;
    public List<String> stages;
}
