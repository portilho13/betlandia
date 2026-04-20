package com.betlandia.match_ingestor.util;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;

public class Time {

    private LocalDate getTodayDate() {
        return LocalDate.now();
    }

    public ArrayList<Pair> getDateRange() {
        LocalDate today = getTodayDate();
        ArrayList<Pair> result = new ArrayList<>();

        // Find this week's Friday
        LocalDate thisFriday = today;

        while (thisFriday.getDayOfWeek() != DayOfWeek.FRIDAY) {
            thisFriday = thisFriday.plusDays(1);
        }

        // Monday after this Friday (Friday -> Monday = +3 days)
        LocalDate thisMonday = thisFriday.plusDays(3);

        // Current week: Friday to Monday
        result.add(new Pair(thisFriday, thisMonday));

        // Next week
        LocalDate nextFriday = thisFriday.plusDays(7);
        LocalDate nextMonday = nextFriday.plusDays(3);

        result.add(new Pair(nextFriday, nextMonday));

        return result;
    }
}