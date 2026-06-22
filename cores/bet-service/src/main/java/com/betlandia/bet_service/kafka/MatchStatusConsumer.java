package com.betlandia.bet_service.kafka;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

import com.betlandia.bet_service.dto.MatchStatusEvent;
import com.betlandia.bet_service.service.MarketService;
import com.betlandia.bet_service.service.BetSettlementService;

@Component
public class MatchStatusConsumer {

    private static final Logger log = LoggerFactory.getLogger(MatchStatusConsumer.class);

    private final MarketService marketService;
    private final BetSettlementService settlementService;

    public MatchStatusConsumer(MarketService marketService, BetSettlementService settlementService) {
        this.marketService = marketService;
        this.settlementService = settlementService;
    }

    @KafkaListener(
        topics = "match-status",
        groupId = "bet-service",
        containerFactory = "matchStatusListenerContainerFactory"
    )
    public void consume(@Payload MatchStatusEvent event) {
        log.info("Match status: fixture={} {} → {}", event.matchId(), event.oldStatus(), event.newStatus());

        int homeScore = event.homeScore() != null ? event.homeScore() : 0;
        int awayScore = event.awayScore() != null ? event.awayScore() : 0;

        switch (event.newStatus()) {
            case "PAUSED" -> marketService.suspendMarketsForFixture(event.matchId());
            case "IN_PLAY" -> marketService.reopenMarketsForFixture(event.matchId());
            case "FINISHED" -> {
                marketService.closeMarketsForFixture(event.matchId());
                settlementService.settleFixture(event.matchId(), homeScore, awayScore);
            }
            case "CANCELLED", "POSTPONED" -> {
                marketService.closeMarketsForFixture(event.matchId());
                settlementService.voidPendingBets(event.matchId());
            }
        }
    }
}
