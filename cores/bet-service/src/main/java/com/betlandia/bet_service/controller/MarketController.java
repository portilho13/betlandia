package com.betlandia.bet_service.controller;

import com.betlandia.bet_service.model.Market;
import com.betlandia.bet_service.service.MarketService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/markets")
public class MarketController {

    private final MarketService marketService;

    public MarketController(MarketService marketService) {
        this.marketService = marketService;
    }

    @GetMapping("/{fixtureId}")
    public List<Market> getMarketsForFixture(@PathVariable Integer fixtureId) {
        return marketService.getMarketsForFixture(fixtureId);
    }
}
