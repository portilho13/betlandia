package com.betlandia.match_ingestor.config;

import java.net.http.HttpClient;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

@Configuration
public class AppConfig {

    @Value("${external.api.mock_url}")
    private String mockUrl;

    @Value("${external.api.url}")
    private String apiUrl;

    @Value("${external.api.key}")
    private String apiKey;

    @Bean("restClient")
    public RestClient restClient() {
        HttpClient httpClient = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_1_1)
            .build();

        return RestClient.builder()
            .requestFactory(new JdkClientHttpRequestFactory(httpClient))
            .baseUrl(apiUrl)
            .defaultHeader("X-Auth-Token", apiKey)
            .build();
    }

    @Bean("mockClient")
    public RestClient mockClient() {
        HttpClient httpClient = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_1_1)
            .build();

        return RestClient.builder()
            .requestFactory(new JdkClientHttpRequestFactory(httpClient))
            .baseUrl(mockUrl)
            .build();
    }
}
