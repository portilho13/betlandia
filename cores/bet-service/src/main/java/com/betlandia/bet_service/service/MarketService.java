package com.betlandia.bet_service.service;

import com.betlandia.bet_service.model.Market;
import com.betlandia.bet_service.model.MarketStatus;
import com.betlandia.bet_service.model.MarketType;
import com.betlandia.bet_service.repository.MarketRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MarketService {

    private static final Logger log = LoggerFactory.getLogger(MarketService.class);

    private final MarketRepository marketRepository;

    public MarketService(MarketRepository marketRepository) {
        this.marketRepository = marketRepository;
    }

    @Transactional
    public void createMarketsForFixture(Integer fixtureId) {
        for (MarketType type : MarketType.values()) {
            if (marketRepository.existsByFixtureIdAndType(fixtureId, type)) {
                continue;
            }
            Market market = new Market();
            market.setFixtureId(fixtureId);
            market.setType(type);
            market.setStatus(MarketStatus.OPEN);
            marketRepository.save(market);
            log.info("Created {} market for fixture {}", type, fixtureId);
        }
    }

    public List<Market> getMarketsForFixture(Integer fixtureId) {
        return marketRepository.findByFixtureId(fixtureId);
    }

    @Transactional
    public void suspendMarketsForFixture(Integer fixtureId) {
        marketRepository.updateStatusForFixture(fixtureId, MarketStatus.SUSPENDED);
        log.info("Suspended all markets for fixture {}", fixtureId);
    }

    @Transactional
    public void reopenMarketsForFixture(Integer fixtureId) {
        marketRepository.updateStatusForFixture(fixtureId, MarketStatus.OPEN);
        log.info("Reopened all markets for fixture {}", fixtureId);
    }

    @Transactional
    public void closeMarketsForFixture(Integer fixtureId) {
        marketRepository.updateStatusForFixture(fixtureId, MarketStatus.CLOSED);
        log.info("Closed all markets for fixture {}", fixtureId);
    }
}
