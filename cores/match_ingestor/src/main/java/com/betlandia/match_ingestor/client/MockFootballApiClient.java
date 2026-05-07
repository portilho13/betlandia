package com.betlandia.match_ingestor.client;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.betlandia.match_ingestor.dto.FootballApiResponseDto;
import com.betlandia.match_ingestor.dto.external.MatchDetailDto;

@Component
public class MockFootballApiClient {
    private final RestClient mockRestClient;

    public MockFootballApiClient(RestClient mockRestClient) {
        this.mockRestClient = mockRestClient;
    }

    public MatchDetailDto fetchMatchDetails(Integer id) {
        String url = String.format("/v4/matches/{id}", id);
        return mockRestClient.get()
            .uri(uri -> uri
                .path(url)
                .build())
            .retrieve()
            .body(MatchDetailDto.class);
    } 
}
