package com.betlandia.api_gateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Value("${betlandia.services.bet-service}")
    private String betServiceUrl;

    @Value("${betlandia.services.odds-calculator}")
    private String oddsCalculatorUrl;

    @Value("${betlandia.services.match-ingestor}")
    private String matchIngestorUrl;

    @Bean("betServiceClient")
    public WebClient betServiceClient() {
        return WebClient.builder().baseUrl(betServiceUrl).build();
    }

    @Bean("oddsCalculatorClient")
    public WebClient oddsCalculatorClient() {
        return WebClient.builder().baseUrl(oddsCalculatorUrl).build();
    }

    @Bean("matchIngestorClient")
    public WebClient matchIngestorClient() {
        return WebClient.builder().baseUrl(matchIngestorUrl).build();
    }
}
