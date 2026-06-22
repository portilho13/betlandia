package com.betlandia.bet_service.kafka;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import com.betlandia.bet_service.dto.BetPlacedEvent;
import com.betlandia.bet_service.dto.BetSettledEvent;

@Service
public class BetProducer {

    private static final Logger log = LoggerFactory.getLogger(BetProducer.class);
    private static final String BET_PLACED_TOPIC = "bet-placed";
    private static final String BET_SETTLED_TOPIC = "bet-settled";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public BetProducer(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendBetPlaced(BetPlacedEvent event) {
        kafkaTemplate.send(BET_PLACED_TOPIC, event.betId(), event)
            .whenComplete((result, ex) -> {
                if (ex != null) {
                    log.error("Failed to send bet-placed event for bet {}", event.betId(), ex);
                } else {
                    log.info("Sent bet-placed: bet={} fixture={}", event.betId(), event.fixtureId());
                }
            });
    }

    public void sendBetSettled(BetSettledEvent event) {
        kafkaTemplate.send(BET_SETTLED_TOPIC, event.betId(), event)
            .whenComplete((result, ex) -> {
                if (ex != null) {
                    log.error("Failed to send bet-settled event for bet {}", event.betId(), ex);
                } else {
                    log.info("Sent bet-settled: bet={} status={}", event.betId(), event.status());
                }
            });
    }
}
