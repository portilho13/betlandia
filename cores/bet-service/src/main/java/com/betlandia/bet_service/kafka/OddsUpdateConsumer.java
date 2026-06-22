package com.betlandia.bet_service.kafka;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

import com.betlandia.bet_service.dto.OddsUpdateDto;

@Component
public class OddsUpdateConsumer {

    private static final Logger log = LoggerFactory.getLogger(OddsUpdateConsumer.class);

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    public OddsUpdateConsumer(StringRedisTemplate redisTemplate, ObjectMapper objectMapper) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    @KafkaListener(
        topics = "odds-updates",
        groupId = "bet-service",
        containerFactory = "oddsUpdateListenerContainerFactory"
    )
    public void consume(@Payload OddsUpdateDto dto) {
        String key = "odds:" + dto.fixtureId() + ":" + dto.marketType();
        try {
            redisTemplate.opsForValue().set(key, objectMapper.writeValueAsString(dto));
            log.debug("Cached odds for key {}", key);
        } catch (JsonProcessingException e) {
            log.error("Failed to cache odds update for fixture {}", dto.fixtureId(), e);
        }
    }
}
