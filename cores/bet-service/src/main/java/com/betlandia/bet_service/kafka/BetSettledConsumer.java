package com.betlandia.bet_service.kafka;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

import com.betlandia.bet_service.dto.BetSettledEvent;

@Component
public class BetSettledConsumer {

    private static final Logger log = LoggerFactory.getLogger(BetSettledConsumer.class);

    @KafkaListener(
        topics = "bet-settled",
        groupId = "bet-service",
        containerFactory = "betSettledListenerContainerFactory"
    )
    public void consume(@Payload BetSettledEvent event) {
        log.info("Bet settled: id={} status={} payout={}", event.betId(), event.status(), event.payout());
    }
}
