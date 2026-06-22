package com.betlandia.odds_calculator.kafka;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import com.betlandia.odds_calculator.dto.OddsUpdateDto;

@Service
public class OddsProducer {
    private static final Logger log = LoggerFactory.getLogger(OddsProducer.class);
    private static final String ODDS_UPDATES_TOPIC = "odds-updates";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public OddsProducer(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendOddsUpdate(OddsUpdateDto dto) {
        kafkaTemplate.send(ODDS_UPDATES_TOPIC, String.valueOf(dto.fixtureId()), dto)
            .whenComplete((result, ex) -> {
                if (ex != null) {
                    log.error("Failed to send odds update for fixture {}", dto.fixtureId(), ex);
                } else {
                    log.info("Sent odds update for fixture {} → partition {}",
                        dto.fixtureId(), result.getRecordMetadata().partition());
                }
            });
    }
}
