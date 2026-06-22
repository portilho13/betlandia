package com.betlandia.bet_service.kafka;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

import com.betlandia.bet_service.dto.Fixture;
import com.betlandia.bet_service.service.MarketService;

@Component
public class FixtureConsumer {

    private static final Logger log = LoggerFactory.getLogger(FixtureConsumer.class);

    private final MarketService marketService;

    public FixtureConsumer(MarketService marketService) {
        this.marketService = marketService;
    }

    @KafkaListener(
        topics = "fixture-registry",
        groupId = "bet-service",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumeFixtureRegistry(@Payload Fixture fixture) {
        log.info("Received fixture {} — creating markets", fixture.getId());
        marketService.createMarketsForFixture(fixture.getMatchId());
    }
}
