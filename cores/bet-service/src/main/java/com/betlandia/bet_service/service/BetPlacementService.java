package com.betlandia.bet_service.service;

import com.betlandia.bet_service.dto.BetPlacedEvent;
import com.betlandia.bet_service.dto.BetResponse;
import com.betlandia.bet_service.dto.OddsUpdateDto;
import com.betlandia.bet_service.dto.PlaceBetRequest;
import com.betlandia.bet_service.kafka.BetProducer;
import com.betlandia.bet_service.model.Bet;
import com.betlandia.bet_service.model.BetSelection;
import com.betlandia.bet_service.model.BetStatus;
import com.betlandia.bet_service.model.Market;
import com.betlandia.bet_service.model.MarketStatus;
import com.betlandia.bet_service.model.User;
import com.betlandia.bet_service.repository.BetRepository;
import com.betlandia.bet_service.repository.MarketRepository;
import com.betlandia.bet_service.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class BetPlacementService {

    private static final Logger log = LoggerFactory.getLogger(BetPlacementService.class);
    private static final BigDecimal ODDS_DRIFT_THRESHOLD = new BigDecimal("0.05");

    private final BetRepository betRepository;
    private final MarketRepository marketRepository;
    private final UserRepository userRepository;
    private final BetProducer betProducer;
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    public BetPlacementService(
        BetRepository betRepository,
        MarketRepository marketRepository,
        UserRepository userRepository,
        BetProducer betProducer,
        StringRedisTemplate redisTemplate,
        ObjectMapper objectMapper
    ) {
        this.betRepository = betRepository;
        this.marketRepository = marketRepository;
        this.userRepository = userRepository;
        this.betProducer = betProducer;
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public BetResponse placeBet(PlaceBetRequest request) {
        Market market = marketRepository.findById(request.marketId())
            .orElseThrow(() -> new IllegalArgumentException("Market not found: " + request.marketId()));

        if (market.getStatus() != MarketStatus.OPEN) {
            throw new IllegalStateException("Market is not open for betting: " + market.getStatus());
        }

        BigDecimal currentOdds = fetchOddsFromCache(market.getFixtureId(), market.getType().name(), request.selection());

        if (request.requestedOdds() != null) {
            BigDecimal drift = request.requestedOdds().subtract(currentOdds).abs();
            if (drift.compareTo(ODDS_DRIFT_THRESHOLD) > 0) {
                throw new IllegalStateException(
                    String.format("Odds have moved. Requested: %s, Current: %s", request.requestedOdds(), currentOdds)
                );
            }
        }

        User user = userRepository.findById(request.userId())
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + request.userId()));

        if (user.getWalletBalance().compareTo(request.stake()) < 0) {
            throw new IllegalStateException("Insufficient balance");
        }

        user.setWalletBalance(user.getWalletBalance().subtract(request.stake()));
        userRepository.save(user);

        BigDecimal payout = request.stake().multiply(currentOdds);

        Bet bet = new Bet();
        bet.setUserId(request.userId());
        bet.setMarketId(request.marketId());
        bet.setSelection(request.selection());
        bet.setOddsAtPlacement(currentOdds);
        bet.setStake(request.stake());
        bet.setPotentialPayout(payout);
        bet.setStatus(BetStatus.PENDING);

        Bet saved = betRepository.save(bet);

        betProducer.sendBetPlaced(new BetPlacedEvent(
            saved.getId().toString(),
            market.getFixtureId(),
            market.getId().toString(),
            request.userId().toString(),
            request.selection().name(),
            currentOdds,
            request.stake()
        ));

        log.info("Bet placed: id={} fixture={} selection={} stake={}",
            saved.getId(), market.getFixtureId(), request.selection(), request.stake());

        return toResponse(saved);
    }

    public List<BetResponse> getBetsForUser(UUID userId) {
        return betRepository.findByUserId(userId).stream().map(this::toResponse).toList();
    }

    private BigDecimal fetchOddsFromCache(Integer fixtureId, String marketType, BetSelection selection) {
        String key = "odds:" + fixtureId + ":" + marketType;
        String cached = redisTemplate.opsForValue().get(key);

        if (cached == null) {
            throw new IllegalStateException("No odds available for fixture " + fixtureId + " market " + marketType);
        }

        try {
            OddsUpdateDto dto = objectMapper.readValue(cached, OddsUpdateDto.class);
            return switch (selection) {
                case HOME -> dto.homeOdd();
                case DRAW -> dto.drawOdd();
                case AWAY -> dto.awayOdd();
            };
        } catch (Exception e) {
            throw new IllegalStateException("Failed to read odds from cache", e);
        }
    }

    private BetResponse toResponse(Bet bet) {
        return new BetResponse(
            bet.getId(),
            bet.getUserId(),
            bet.getMarketId(),
            bet.getSelection(),
            bet.getOddsAtPlacement(),
            bet.getStake(),
            bet.getPotentialPayout(),
            bet.getStatus(),
            bet.getPlacedAt()
        );
    }
}
