package com.betlandia.match_ingestor.scheduler;

import java.util.ArrayList;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.betlandia.match_ingestor.services.FixtureService;
import com.betlandia.match_ingestor.util.DateScheduler;
import com.betlandia.match_ingestor.util.Pair;

@Component
public class FixtureScheduler {

    private final FixtureService matchService;
    private final DateScheduler dateScheduler;

    public FixtureScheduler(
        FixtureService matchService,
        DateScheduler dateScheduler
    ) {
        this.matchService = matchService;
        this.dateScheduler = dateScheduler;
    }

    @Scheduled(cron = "0 * * * * *")
    public void FetchUpcommingMatches() {
        ArrayList<Pair> dates = dateScheduler.getDateRange();

        Pair currentWeek = dates.get(0); // current week in idx 0
        Pair nextWeek = dates.get(1); // next week in idx 1

        matchService.ingestFromApi(currentWeek);
        matchService.ingestFromApi(nextWeek);
    }
}
