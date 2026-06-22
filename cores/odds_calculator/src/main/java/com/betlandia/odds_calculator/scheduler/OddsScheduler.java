package com.betlandia.odds_calculator.scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.betlandia.odds_calculator.service.OddsService;

@Component
public class OddsScheduler {
    private final OddsService oddsService;

    public OddsScheduler(
        OddsService oddsService
    ) {
        this.oddsService = oddsService;
    }

    //@Scheduled(cron = "0 * * * * *")
    public void FetchPreMatchOdds() {
    }
}
