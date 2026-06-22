package com.betlandia.odds_calculator.kafka;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;

import com.betlandia.odds_calculator.dto.BetPlacedEvent;
import com.betlandia.odds_calculator.service.OddsService;

@Service
public class BetPlacedConsumer {

    private static final Logger log = LoggerFactory.getLogger(BetPlacedConsumer.class);

    private final OddsService oddsService;

    public BetPlacedConsumer(OddsService oddsService) {
        this.oddsService = oddsService;
    }

    @KafkaListener(
        topics = "bet-placed",
        groupId = "odds-calculator",
        containerFactory = "betPlacedListenerContainerFactory"
    )
    public void consume(@Payload BetPlacedEvent event) {
        log.info("Received bet-placed: fixture={} selection={} stake={}", event.fixtureId(), event.selection(), event.stake());
        oddsService.adjustForBetVolume(event);
    }
}
