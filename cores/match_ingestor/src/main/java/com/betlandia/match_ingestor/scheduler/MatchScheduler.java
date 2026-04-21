package com.betlandia.match_ingestor.scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.betlandia.match_ingestor.services.MatchService;

@Component
public class MatchScheduler {

    private final MatchService matchService;

    public MatchScheduler(MatchService matchService) {
        this.matchService = matchService;
    }

    @Scheduled(cron = "0 * * * * *")
    public void FetchUpcommingMatches() {
        matchService.ingestFromApi();
    }
}
