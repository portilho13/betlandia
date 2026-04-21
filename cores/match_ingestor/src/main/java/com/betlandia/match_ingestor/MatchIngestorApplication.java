package com.betlandia.match_ingestor;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MatchIngestorApplication {

	public static void main(String[] args) {
		SpringApplication.run(MatchIngestorApplication.class, args);
	}

}
