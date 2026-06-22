package com.betlandia.odds_calculator.kafka;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;

import com.betlandia.odds_calculator.dto.MatchStatusEvent;
import com.betlandia.odds_calculator.service.OddsService;

@Service
public class MatchStatusConsumer {

    private static final Logger log = LoggerFactory.getLogger(MatchStatusConsumer.class);

    private final OddsService oddsService;

    public MatchStatusConsumer(OddsService oddsService) {
        this.oddsService = oddsService;
    }

    @KafkaListener(
        topics = "match-status",
        groupId = "odds-calculator",
        containerFactory = "matchStatusListenerContainerFactory"
    )
    public void consume(@Payload MatchStatusEvent event) {
        log.info("Received match status: fixture={} {} → {}", event.matchId(), event.oldStatus(), event.newStatus());
        oddsService.handleMatchStatus(event);
    }
}
