package com.betlandia.bet_service.config;

import java.util.HashMap;
import java.util.Map;

import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.kafka.support.serializer.JsonDeserializer;
import org.springframework.kafka.support.serializer.JsonSerializer;

import com.betlandia.bet_service.dto.BetSettledEvent;
import com.betlandia.bet_service.dto.MatchStatusEvent;
import com.betlandia.bet_service.dto.OddsUpdateDto;
import com.betlandia.bet_service.dto.Fixture;

@EnableKafka
@Configuration
public class KafkaConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    @Bean
    public NewTopic betPlaced() {
        return TopicBuilder.name("bet-placed").partitions(3).replicas(1).build();
    }

    @Bean
    public NewTopic betSettled() {
        return TopicBuilder.name("bet-settled").partitions(3).replicas(1).build();
    }

    @Bean
    public ConsumerFactory<String, Fixture> fixtureConsumerFactory() {
        JsonDeserializer<Fixture> des = new JsonDeserializer<>(Fixture.class);
        des.addTrustedPackages("*");
        des.setUseTypeHeaders(false);
        return new DefaultKafkaConsumerFactory<>(consumerProps("bet-service"), new StringDeserializer(), des);
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, Fixture> kafkaListenerContainerFactory(
            ConsumerFactory<String, Fixture> fixtureConsumerFactory) {
        var factory = new ConcurrentKafkaListenerContainerFactory<String, Fixture>();
        factory.setConsumerFactory(fixtureConsumerFactory);
        return factory;
    }

    @Bean
    public ConsumerFactory<String, MatchStatusEvent> matchStatusConsumerFactory() {
        JsonDeserializer<MatchStatusEvent> des = new JsonDeserializer<>(MatchStatusEvent.class);
        des.addTrustedPackages("*");
        des.setUseTypeHeaders(false);
        return new DefaultKafkaConsumerFactory<>(consumerProps("bet-service"), new StringDeserializer(), des);
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, MatchStatusEvent> matchStatusListenerContainerFactory(
            ConsumerFactory<String, MatchStatusEvent> matchStatusConsumerFactory) {
        var factory = new ConcurrentKafkaListenerContainerFactory<String, MatchStatusEvent>();
        factory.setConsumerFactory(matchStatusConsumerFactory);
        return factory;
    }

    @Bean
    public ConsumerFactory<String, OddsUpdateDto> oddsUpdateConsumerFactory() {
        JsonDeserializer<OddsUpdateDto> des = new JsonDeserializer<>(OddsUpdateDto.class);
        des.addTrustedPackages("*");
        des.setUseTypeHeaders(false);
        return new DefaultKafkaConsumerFactory<>(consumerProps("bet-service"), new StringDeserializer(), des);
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, OddsUpdateDto> oddsUpdateListenerContainerFactory(
            ConsumerFactory<String, OddsUpdateDto> oddsUpdateConsumerFactory) {
        var factory = new ConcurrentKafkaListenerContainerFactory<String, OddsUpdateDto>();
        factory.setConsumerFactory(oddsUpdateConsumerFactory);
        return factory;
    }

    @Bean
    public ConsumerFactory<String, BetSettledEvent> betSettledConsumerFactory() {
        JsonDeserializer<BetSettledEvent> des = new JsonDeserializer<>(BetSettledEvent.class);
        des.addTrustedPackages("*");
        des.setUseTypeHeaders(false);
        return new DefaultKafkaConsumerFactory<>(consumerProps("bet-service"), new StringDeserializer(), des);
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, BetSettledEvent> betSettledListenerContainerFactory(
            ConsumerFactory<String, BetSettledEvent> betSettledConsumerFactory) {
        var factory = new ConcurrentKafkaListenerContainerFactory<String, BetSettledEvent>();
        factory.setConsumerFactory(betSettledConsumerFactory);
        return factory;
    }

    @Bean
    public ProducerFactory<String, Object> producerFactory() {
        Map<String, Object> props = new HashMap<>();
        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
        props.put(JsonSerializer.ADD_TYPE_INFO_HEADERS, false);
        return new DefaultKafkaProducerFactory<>(props);
    }

    @Bean
    public KafkaTemplate<String, Object> kafkaTemplate(ProducerFactory<String, Object> producerFactory) {
        return new KafkaTemplate<>(producerFactory);
    }

    private Map<String, Object> consumerProps(String groupId) {
        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, groupId);
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        return props;
    }
}
