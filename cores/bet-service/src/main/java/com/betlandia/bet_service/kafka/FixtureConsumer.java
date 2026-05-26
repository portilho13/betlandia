package com.betlandia.bet_service.kafka;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

import com.betlandia.bet_service.dto.Fixture;

@Component
public class FixtureConsumer {
    private static final Logger log = LoggerFactory.getLogger(FixtureConsumer.class);

    public FixtureConsumer() {

    }

    @KafkaListener(
        topics = "fixture-registry",
        groupId = "bet-service"
    )
    public void consumeFixtureRegistry(
        @Payload Fixture fixture
    ) {
        log.info("Received fixture {}", fixture.getId());
    }
}
