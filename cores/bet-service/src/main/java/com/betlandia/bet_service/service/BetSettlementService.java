package com.betlandia.bet_service.service;

import com.betlandia.bet_service.dto.BetSettledEvent;
import com.betlandia.bet_service.kafka.BetProducer;
import com.betlandia.bet_service.model.Bet;
import com.betlandia.bet_service.model.BetSelection;
import com.betlandia.bet_service.model.BetStatus;
import com.betlandia.bet_service.model.Market;
import com.betlandia.bet_service.model.MarketType;
import com.betlandia.bet_service.repository.BetRepository;
import com.betlandia.bet_service.repository.MarketRepository;
import com.betlandia.bet_service.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class BetSettlementService {

    private static final Logger log = LoggerFactory.getLogger(BetSettlementService.class);

    private final BetRepository betRepository;
    private final MarketRepository marketRepository;
    private final UserRepository userRepository;
    private final BetProducer betProducer;

    public BetSettlementService(
        BetRepository betRepository,
        MarketRepository marketRepository,
        UserRepository userRepository,
        BetProducer betProducer
    ) {
        this.betRepository = betRepository;
        this.marketRepository = marketRepository;
        this.userRepository = userRepository;
        this.betProducer = betProducer;
    }

    @Transactional
    public void settleFixture(Integer fixtureId, int homeScore, int awayScore) {
        BetSelection matchWinner = resolveMatchWinner(homeScore, awayScore);
        boolean bothScored = homeScore > 0 && awayScore > 0;
        boolean overTwoAndHalf = (homeScore + awayScore) > 2;

        List<Market> markets = marketRepository.findByFixtureId(fixtureId);

        for (Market market : markets) {
            List<Bet> pendingBets = betRepository.findByMarketIdAndStatus(market.getId(), BetStatus.PENDING);

            for (Bet bet : pendingBets) {
                BetStatus result = determineOutcome(bet, market.getType(), matchWinner, bothScored, overTwoAndHalf);
                bet.setStatus(result);
                betRepository.save(bet);

                BigDecimal payout = result == BetStatus.WON ? bet.getPotentialPayout() : BigDecimal.ZERO;

                if (result == BetStatus.WON) {
                    userRepository.findById(bet.getUserId()).ifPresent(user -> {
                        user.setWalletBalance(user.getWalletBalance().add(payout));
                        userRepository.save(user);
                    });
                }

                betProducer.sendBetSettled(new BetSettledEvent(
                    bet.getId().toString(),
                    bet.getUserId().toString(),
                    result.name(),
                    payout
                ));

                log.info("Settled bet {}: {} (score {} - {})", bet.getId(), result, homeScore, awayScore);
            }
        }
    }

    @Transactional
    public void voidPendingBets(Integer fixtureId) {
        List<Bet> pendingBets = betRepository.findByFixtureIdAndStatus(fixtureId, BetStatus.PENDING);

        for (Bet bet : pendingBets) {
            bet.setStatus(BetStatus.VOID);
            betRepository.save(bet);

            userRepository.findById(bet.getUserId()).ifPresent(user -> {
                user.setWalletBalance(user.getWalletBalance().add(bet.getStake()));
                userRepository.save(user);
            });

            betProducer.sendBetSettled(new BetSettledEvent(
                bet.getId().toString(),
                bet.getUserId().toString(),
                BetStatus.VOID.name(),
                bet.getStake()
            ));

            log.info("Voided bet {} and refunded stake {}", bet.getId(), bet.getStake());
        }
    }

    private BetSelection resolveMatchWinner(int homeScore, int awayScore) {
        if (homeScore > awayScore) return BetSelection.HOME;
        if (awayScore > homeScore) return BetSelection.AWAY;
        return BetSelection.DRAW;
    }

    private BetStatus determineOutcome(
        Bet bet, MarketType marketType,
        BetSelection matchWinner, boolean bothScored, boolean overTwoAndHalf
    ) {
        return switch (marketType) {
            case MATCH_WINNER -> bet.getSelection() == matchWinner ? BetStatus.WON : BetStatus.LOST;
            case BTTS -> {
                boolean betOnYes = bet.getSelection() == BetSelection.HOME;
                yield (betOnYes == bothScored) ? BetStatus.WON : BetStatus.LOST;
            }
            case OVER_UNDER -> {
                boolean betOnOver = bet.getSelection() == BetSelection.HOME;
                yield (betOnOver == overTwoAndHalf) ? BetStatus.WON : BetStatus.LOST;
            }
        };
    }
}
