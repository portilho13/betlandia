package com.betlandia.bet_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.kafka.annotation.EnableKafka;

@SpringBootApplication
@EnableKafka
public class BetServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(BetServiceApplication.class, args);
	}

}
