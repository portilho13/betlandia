package com.betlandia.match_ingestor.controller;

import com.betlandia.match_ingestor.model.Fixture;
import com.betlandia.match_ingestor.model.FixtureStatus;
import com.betlandia.match_ingestor.repository.FixtureRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/fixtures")
public class FixtureController {

    private final FixtureRepository fixtureRepository;

    public FixtureController(FixtureRepository fixtureRepository) {
        this.fixtureRepository = fixtureRepository;
    }

    @GetMapping
    public List<Fixture> getAll() {
        return fixtureRepository.findAll();
    }

    @GetMapping("/live")
    public List<Fixture> getLive() {
        return fixtureRepository.findByStatusIn(
            List.of(FixtureStatus.IN_PLAY, FixtureStatus.PAUSED)
        );
    }

    @GetMapping("/{matchId}")
    public Fixture getByMatchId(@PathVariable Integer matchId) {
        return fixtureRepository.findByMatchId(matchId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Fixture not found: " + matchId));
    }
}
