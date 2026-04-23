package com.betlandia.match_ingestor.client;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.betlandia.match_ingestor.dto.FootballApiResponseDto;

@Component
public class FootballApiClient {
    private final RestClient restClient;

    public FootballApiClient(RestClient restClient) {
        this.restClient = restClient;
    }

    public FootballApiResponseDto fetchMatches(String dateFrom, String dateTo) {
        return restClient.get()
            .uri(uri -> uri
                .path("/competitions/PPL/matches")
                .queryParam("dateFrom", dateFrom)
                .queryParam("dateTo", dateTo)
                .build())
            .retrieve()
            .body(FootballApiResponseDto.class);
    }
}
