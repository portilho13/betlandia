package com.betlandia.bet_service.controller;

import com.betlandia.bet_service.dto.BetResponse;
import com.betlandia.bet_service.dto.PlaceBetRequest;
import com.betlandia.bet_service.service.BetPlacementService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/bets")
public class BetController {

    private final BetPlacementService betPlacementService;

    public BetController(BetPlacementService betPlacementService) {
        this.betPlacementService = betPlacementService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BetResponse placeBet(@RequestBody PlaceBetRequest request) {
        return betPlacementService.placeBet(request);
    }

    @GetMapping("/{userId}")
    public List<BetResponse> getBetsForUser(@PathVariable UUID userId) {
        return betPlacementService.getBetsForUser(userId);
    }
}
