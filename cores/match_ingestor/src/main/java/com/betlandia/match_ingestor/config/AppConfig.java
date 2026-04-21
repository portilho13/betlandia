package com.betlandia.match_ingestor.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class AppConfig {

    @Value("${external.api.url}")
    private String apiUrl;

    @Value("${external.api.key}")
    private String apiKey;

    @Bean
    public RestClient restClient() {
        return RestClient.builder()
            .baseUrl(apiUrl)
            .defaultHeader("X-Auth-Token", apiKey)
            .build();
    }
}
