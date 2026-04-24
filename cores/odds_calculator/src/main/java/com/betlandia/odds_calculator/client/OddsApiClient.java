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

    public MatchHeadToHeadResponseDto fetchHeadToHeadMatches() {
        return restClient.get()
            .uri(uri -> uri
                .path("/matches/545975/head2head")
                .build())
            .retrieve()
            .body(MatchHeadToHeadResponseDto.class);
    }

    
}
