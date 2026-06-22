package com.betlandia.api_gateway.config;

import com.betlandia.api_gateway.dto.OddsUpdateDto;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.support.serializer.JsonDeserializer;

import java.util.HashMap;
import java.util.Map;

@EnableKafka
@Configuration
public class KafkaConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    @Bean
    public ConsumerFactory<String, OddsUpdateDto> oddsUpdateConsumerFactory() {
        JsonDeserializer<OddsUpdateDto> des = new JsonDeserializer<>(OddsUpdateDto.class);
        des.addTrustedPackages("*");
        des.setUseTypeHeaders(false);

        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "api-gateway");
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "latest");

        return new DefaultKafkaConsumerFactory<>(props, new StringDeserializer(), des);
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, OddsUpdateDto> kafkaListenerContainerFactory(
            ConsumerFactory<String, OddsUpdateDto> oddsUpdateConsumerFactory) {
        var factory = new ConcurrentKafkaListenerContainerFactory<String, OddsUpdateDto>();
        factory.setConsumerFactory(oddsUpdateConsumerFactory);
        return factory;
    }
}
