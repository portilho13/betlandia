package com.betlandia.odds_calculator.client;

import org.springframework.web.client.RestClient;

import com.betlandia.odds_calculator.dto.MatchHeadToHeadResponseDto;

public class FootballApiClient {
    private final RestClient restClient;

    public FootballApiClient(RestClient restClient) {
        this.restClient = restClient;
    }

    public MatchHeadToHeadResponseDto fetchHeadToHeadMatches() {
        return restClient.get()
            .uri(uri -> uri
                .path("/matches/545975/head2head")
                .build())
            .retrieve()
            .body(MatchHeadToHeadResponseDto.class);
    }

    
}
