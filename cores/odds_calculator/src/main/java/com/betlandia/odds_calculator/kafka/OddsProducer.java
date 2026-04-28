package com.betlandia.odds_calculator.kafka;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import com.betlandia.odds_calculator.model.MarketOdds;

@Service
public class OddsProducer {
    private static final Logger log = LoggerFactory.getLogger(OddsProducer.class);

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public OddsProducer(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendTopic(MarketOdds marketOdds, String topic) {
        kafkaTemplate.send(topic, String.valueOf(marketOdds.getId()), marketOdds)
            .whenComplete((result, ex) -> {
                if (ex != null) {
                    log.error("Failed to send odds {} to topic {}", marketOdds.getId(), topic, ex);
                } else {
                    log.info("Sent odds {} → topic {} partition {}",
                        marketOdds.getId(),
                        topic,
                        result.getRecordMetadata().partition()
                    );
                }
            });
    }
}
