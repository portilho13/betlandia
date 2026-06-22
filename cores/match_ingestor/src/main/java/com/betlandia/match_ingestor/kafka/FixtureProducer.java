package com.betlandia.match_ingestor.kafka;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import com.betlandia.match_ingestor.dto.MatchEventDto;
import com.betlandia.match_ingestor.dto.MatchStatusEvent;
import com.betlandia.match_ingestor.model.Fixture;
import com.betlandia.match_ingestor.model.FixtureStatus;

import java.time.Instant;

@Service
public class FixtureProducer {

    private static final Logger log = LoggerFactory.getLogger(FixtureProducer.class);
    private static final String MATCH_EVENTS_TOPIC = "match-events";
    private static final String MATCH_STATUS_TOPIC = "match-status";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public FixtureProducer(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendTopic(Fixture fixture, String topic) {
        kafkaTemplate.send(topic, String.valueOf(fixture.getId()), fixture)
            .whenComplete((result, ex) -> {
                if (ex != null) {
                    log.error("Failed to send fixture {} to topic {}", fixture.getId(), topic, ex);
                } else {
                    log.info("Sent fixture {} → topic {} partition {}",
                        fixture.getId(), topic, result.getRecordMetadata().partition());
                }
            });
    }

    public void sendMatchStatusEvent(Fixture fixture, FixtureStatus oldStatus, FixtureStatus newStatus) {
        MatchStatusEvent event = new MatchStatusEvent(
            fixture.getMatchId(),
            fixture.getHomeTeam(),
            fixture.getAwayTeam(),
            oldStatus.name(),
            newStatus.name(),
            fixture.getHomeScore() != null ? fixture.getHomeScore() : 0,
            fixture.getAwayScore() != null ? fixture.getAwayScore() : 0,
            Instant.now()
        );

        kafkaTemplate.send(MATCH_STATUS_TOPIC, String.valueOf(fixture.getMatchId()), event)
            .whenComplete((result, ex) -> {
                if (ex != null) {
                    log.error("Failed to send match status event for match {}", fixture.getMatchId(), ex);
                } else {
                    log.info("Sent status change {} → {} for match {}", oldStatus, newStatus, fixture.getMatchId());
                }
            });
    }

    public void sendMatchEvent(Fixture fixture, int homeScore, int awayScore) {
        MatchEventDto event = new MatchEventDto(
            fixture.getMatchId(),
            fixture.getHomeTeam(),
            fixture.getAwayTeam(),
            homeScore,
            awayScore,
            "GOAL"
        );

        kafkaTemplate.send(MATCH_EVENTS_TOPIC, String.valueOf(fixture.getMatchId()), event)
            .whenComplete((result, ex) -> {
                if (ex != null) {
                    log.error("Failed to send match event for match {}", fixture.getMatchId(), ex);
                } else {
                    log.info("Sent GOAL event for match {} → {} - {}",
                        fixture.getMatchId(), homeScore, awayScore);
                }
            });
    }
}
