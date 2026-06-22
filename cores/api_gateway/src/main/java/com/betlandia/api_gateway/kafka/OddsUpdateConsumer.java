package com.betlandia.api_gateway.kafka;

import com.betlandia.api_gateway.dto.OddsUpdateDto;
import com.betlandia.api_gateway.websocket.OddsWebSocketBroadcaster;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

@Component
public class OddsUpdateConsumer {

    private static final Logger log = LoggerFactory.getLogger(OddsUpdateConsumer.class);

    private final OddsWebSocketBroadcaster broadcaster;

    public OddsUpdateConsumer(OddsWebSocketBroadcaster broadcaster) {
        this.broadcaster = broadcaster;
    }

    @KafkaListener(
        topics = "odds-updates",
        groupId = "api-gateway",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void consume(@Payload OddsUpdateDto dto) {
        log.info("Received odds update for fixture {}: home={} draw={} away={}",
            dto.fixtureId(), dto.homeOdd(), dto.drawOdd(), dto.awayOdd());
        broadcaster.broadcast(dto);
    }
}
