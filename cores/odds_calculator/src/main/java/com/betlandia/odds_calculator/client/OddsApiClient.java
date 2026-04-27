package com.betlandia.odds_calculator.client;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.betlandia.odds_calculator.dto.MatchHeadToHeadResponseDto;

@Component
public class OddsApiClient {
    private final RestClient restClient;

    public OddsApiClient(RestClient restClient) {
        this.restClient = restClient;
    }

    public MatchHeadToHeadResponseDto fetchHeadToHeadMatches(String matchId) {
        return restClient.get()
            .uri("/matches/{matchId}/head2head", matchId)
            .retrieve()
            .body(MatchHeadToHeadResponseDto.class);
    }

    
}
