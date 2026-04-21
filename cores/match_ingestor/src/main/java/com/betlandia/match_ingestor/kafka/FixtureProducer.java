package com.betlandia.match_ingestor.kafka;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import com.betlandia.match_ingestor.model.Fixture;


@Service
public class FixtureProducer {

    private static final Logger log = LoggerFactory.getLogger(FixtureProducer.class);

    private final KafkaTemplate<String, Fixture> kafkaTemplate;

    public FixtureProducer(KafkaTemplate<String, Fixture> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendTopic(Fixture fixture, String topic) {
        kafkaTemplate.send(topic, String.valueOf(fixture.getId()), fixture)
            .whenComplete((result, ex) -> {
                if (ex != null) {
                    log.error("Failed to send match {} to topic {}", fixture.getId(), topic, ex);
                } else {
                    log.info("Sent match {} → topic {} partition {}",
                        fixture.getId(),
                        topic,
                        result.getRecordMetadata().partition()
                    );
                }
            });
    }
}