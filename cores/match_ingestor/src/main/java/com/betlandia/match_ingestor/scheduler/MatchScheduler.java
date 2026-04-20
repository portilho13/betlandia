package com.betlandia.match_ingestor.scheduler;

import java.sql.Time;
import java.util.ArrayList;

import org.springframework.scheduling.annotation.Scheduled;

import com.betlandia.match_ingestor.client.FootballApiClient;
import com.betlandia.match_ingestor.dto.external.FootballApiResponseDto;
import com.betlandia.match_ingestor.util.Pair;

public class MatchScheduler {
    private final FootballApiClient footballApiClient;
    private final com.betlandia.match_ingestor.util.Time timer;

    public MatchScheduler(
        FootballApiClient footballApiClient,
        com.betlandia.match_ingestor.util.Time timer
    ) {
        this.footballApiClient = footballApiClient;
        this.timer = timer;
    }

    @Scheduled(cron = "0 * * * * *")
    public void FetchUpcommingMatches() {
        ArrayList<Pair> dates = timer.getDateRange();
        
        Pair currentWeekDates = dates.get(0);   //Current week at idx 0
        Pair nextWeekDates = dates.get(1);  //Next week at idx 1

        FootballApiResponseDto currentWeekDto = this.footballApiClient.fetchMatches(currentWeekDates.getFriday(), currentWeekDates.getMonday());
        FootballApiResponseDto nextWeekDto = this.footballApiClient.fetchMatches(nextWeekDates.getFriday(), nextWeekDates.getMonday());
    }
}
