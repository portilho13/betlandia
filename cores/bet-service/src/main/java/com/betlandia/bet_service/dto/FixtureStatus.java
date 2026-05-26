package com.betlandia.bet_service.dto;

public enum FixtureStatus {
    SCHEDULED,
    LIVE,
    IN_PLAY,
    PAUSED,
    FINISHED,
    POSTPONED,
    SUSPENDED,
    CANCELLED;

    public static FixtureStatus fromString(String value) {
        if ("TIMED".equals(value)) { // Hard coded because docs of api are wrong
            return FixtureStatus.SCHEDULED;
        }

        else if (value == null) {
            throw new IllegalArgumentException("Fixture status cannot be null");
        }

        try {
            return FixtureStatus.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Unknown fixture status: " + value);
        }
    }
}
