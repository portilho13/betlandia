package com.betlandia.api_gateway.websocket;

import com.betlandia.api_gateway.dto.OddsUpdateDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
public class OddsWebSocketBroadcaster {

    private static final Logger log = LoggerFactory.getLogger(OddsWebSocketBroadcaster.class);

    private final SimpMessagingTemplate messagingTemplate;

    public OddsWebSocketBroadcaster(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void broadcast(OddsUpdateDto dto) {
        String destination = "/topic/odds/" + dto.fixtureId();
        messagingTemplate.convertAndSend(destination, dto);
        log.debug("Pushed odds update to {} for fixture {}", destination, dto.fixtureId());
    }
}
