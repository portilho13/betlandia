package com.betlandia.odds_calculator.controller;

import com.betlandia.odds_calculator.model.MarketOdds;
import com.betlandia.odds_calculator.repository.OddsRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/odds")
public class OddsController {

    private final OddsRepository oddsRepository;

    public OddsController(OddsRepository oddsRepository) {
        this.oddsRepository = oddsRepository;
    }

    @GetMapping("/{fixtureId}")
    public List<MarketOdds> getOddsForFixture(@PathVariable Integer fixtureId) {
        return oddsRepository.findByFixtureId(fixtureId);
    }
}
