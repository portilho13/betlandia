package com.betlandia.odds_calculator.kafka;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;

import com.betlandia.odds_calculator.model.Fixture;
import com.betlandia.odds_calculator.service.OddsService;


@Service
public class FixtureConsumer {

    private static final Logger log = LoggerFactory.getLogger(FixtureConsumer.class);

    private final OddsService oddsService;

    public FixtureConsumer(OddsService oddsService) {
        this.oddsService = oddsService;
    }

    @KafkaListener(
        topics = "fixture-registry",
        groupId = "odds-calculator"
    )
    public void consume(
        @Payload Fixture fixture,
        @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
        @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
        @Header(KafkaHeaders.OFFSET) long offset
    ) {
        log.info("Received fixture {} from topic={} partition={} offset={}",
            fixture.getId(), topic, partition, offset);

            oddsService.populatePreMatchOdds(fixture.getMatchId());
        
    }
}
