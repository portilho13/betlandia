package com.betlandia.match_ingestor.client;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.betlandia.match_ingestor.dto.FootballApiResponseDto;
import com.betlandia.match_ingestor.dto.external.MatchDetailDto;
import com.betlandia.match_ingestor.dto.external.MatchResponseDto;

@Component
public class MockApiClient {
    private final RestClient restClient;

    public MockApiClient(@Qualifier("mockClient") RestClient restClient) {
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

    public MatchDetailDto fetchMatchDetails(Integer id) {
        MatchResponseDto response = restClient.get()
            .uri("/matches/{id}", id)
            .retrieve()
            .body(MatchResponseDto.class);

        return response.match();
    }
}