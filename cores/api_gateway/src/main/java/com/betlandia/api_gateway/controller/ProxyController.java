package com.betlandia.api_gateway.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@RestController
public class ProxyController {

    private static final Logger log = LoggerFactory.getLogger(ProxyController.class);

    private final WebClient betServiceClient;
    private final WebClient oddsCalculatorClient;
    private final WebClient matchIngestorClient;

    public ProxyController(
        @Qualifier("betServiceClient") WebClient betServiceClient,
        @Qualifier("oddsCalculatorClient") WebClient oddsCalculatorClient,
        @Qualifier("matchIngestorClient") WebClient matchIngestorClient
    ) {
        this.betServiceClient = betServiceClient;
        this.oddsCalculatorClient = oddsCalculatorClient;
        this.matchIngestorClient = matchIngestorClient;
    }

    // ── Fixtures (match_ingestor) ─────────────────────────────────────────────

    @GetMapping("/fixtures")
    public ResponseEntity<String> getFixtures() {
        String response = matchIngestorClient.get().uri("/fixtures")
            .retrieve().bodyToMono(String.class).block();
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(response);
    }

    @GetMapping("/fixtures/live")
    public ResponseEntity<String> getLiveFixtures() {
        String response = matchIngestorClient.get().uri("/fixtures/live")
            .retrieve().bodyToMono(String.class).block();
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(response);
    }

    @GetMapping("/fixtures/{matchId}")
    public ResponseEntity<String> getFixture(@PathVariable String matchId) {
        String response = matchIngestorClient.get().uri("/fixtures/" + matchId)
            .retrieve().bodyToMono(String.class).block();
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(response);
    }

    // ── Odds (odds_calculator) ────────────────────────────────────────────────

    @GetMapping("/odds/{fixtureId}")
    public ResponseEntity<String> getOdds(@PathVariable String fixtureId) {
        String response = oddsCalculatorClient.get().uri("/odds/" + fixtureId)
            .retrieve().bodyToMono(String.class).block();
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(response);
    }

    // ── Markets (bet_service) ─────────────────────────────────────────────────

    @GetMapping("/markets/{fixtureId}")
    public ResponseEntity<String> getMarkets(@PathVariable String fixtureId) {
        String response = betServiceClient.get().uri("/markets/" + fixtureId)
            .retrieve().bodyToMono(String.class).block();
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(response);
    }

    // ── Bets (bet_service) ────────────────────────────────────────────────────

    @PostMapping("/bets")
    public ResponseEntity<String> placeBet(@RequestBody String body) {
        try {
            String response = betServiceClient.post().uri("/bets")
                .contentType(MediaType.APPLICATION_JSON).bodyValue(body)
                .retrieve().bodyToMono(String.class).block();
            return ResponseEntity.status(201).contentType(MediaType.APPLICATION_JSON).body(response);
        } catch (WebClientResponseException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ex.getResponseBodyAsString());
        }
    }

    @GetMapping("/bets/{userId}")
    public ResponseEntity<String> getBets(@PathVariable String userId) {
        String response = betServiceClient.get().uri("/bets/" + userId)
            .retrieve().bodyToMono(String.class).block();
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(response);
    }

    // ── Users (bet_service) ───────────────────────────────────────────────────

    @PostMapping("/users")
    public ResponseEntity<String> createUser(@RequestBody String body) {
        try {
            String response = betServiceClient.post().uri("/users")
                .contentType(MediaType.APPLICATION_JSON).bodyValue(body)
                .retrieve().bodyToMono(String.class).block();
            return ResponseEntity.status(201).contentType(MediaType.APPLICATION_JSON).body(response);
        } catch (WebClientResponseException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ex.getResponseBodyAsString());
        }
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<String> getUser(@PathVariable String id) {
        String response = betServiceClient.get().uri("/users/" + id)
            .retrieve().bodyToMono(String.class).block();
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(response);
    }

    @GetMapping("/users/by-username/{username}")
    public ResponseEntity<String> getUserByUsername(@PathVariable String username) {
        String response = betServiceClient.get().uri("/users/by-username/" + username)
            .retrieve().bodyToMono(String.class).block();
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(response);
    }

    @GetMapping("/users")
    public ResponseEntity<String> listUsers() {
        String response = betServiceClient.get().uri("/users")
            .retrieve().bodyToMono(String.class).block();
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(response);
    }

    @PostMapping("/users/{id}/balance")
    public ResponseEntity<String> addBalance(@PathVariable String id, @RequestBody String body) {
        try {
            String response = betServiceClient.post().uri("/users/" + id + "/balance")
                .contentType(MediaType.APPLICATION_JSON).bodyValue(body)
                .retrieve().bodyToMono(String.class).block();
            return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(response);
        } catch (WebClientResponseException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ex.getResponseBodyAsString());
        }
    }
}
