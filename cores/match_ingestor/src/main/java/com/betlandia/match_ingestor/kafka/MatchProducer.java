package com.betlandia.match_ingestor.kafka;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import com.betlandia.match_ingestor.model.Match;

@Component
public class MatchProducer {

    private static final Logger log = LoggerFactory.getLogger(MatchProducer.class);
    private static final String TOPIC = "matches-topic";

    private final KafkaTemplate<String, Match> kafkaTemplate;

    public MatchProducer(KafkaTemplate<String, Match> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendMatch(Match match) {
        kafkaTemplate.send(TOPIC, String.valueOf(match.getId()), match)
            .whenComplete((result, ex) -> {
                if (ex != null) {
                    log.error("Failed to send match {} to topic {}", match.getId(), TOPIC, ex);
                } else {
                    log.info("Sent match {} → topic {} partition {}",
                        match.getId(),
                        TOPIC,
                        result.getRecordMetadata().partition()
                    );
                }
            });
    }
}