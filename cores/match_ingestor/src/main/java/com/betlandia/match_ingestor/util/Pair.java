package com.betlandia.match_ingestor.util;

import java.time.LocalDate;

public class Pair {
    private final LocalDate friday;
    private final LocalDate monday;

    public Pair(LocalDate friday, LocalDate monday) {
        this.friday = friday;
        this.monday = monday;
    }

    public String getFriday() {
        return friday.toString();
    }

    public String getMonday() {
        return monday.toString();
    }

    @Override
    public String toString() {
        return "Friday: " + friday +
               ", Monday: " + monday;
    }
}