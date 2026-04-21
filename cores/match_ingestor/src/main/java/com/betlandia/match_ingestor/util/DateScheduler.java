package com.betlandia.match_ingestor.util;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;

import org.springframework.stereotype.Component;

@Component
public class DateScheduler {

    private LocalDate getTodayDate() {
        return LocalDate.now();
    }

    public ArrayList<Pair> getDateRange() {
        LocalDate today = getTodayDate();
        ArrayList<Pair> result = new ArrayList<>();

        DayOfWeek dow = today.getDayOfWeek();

        LocalDate windowStart;
        LocalDate windowEnd;

        if (dow == DayOfWeek.FRIDAY) {
            // Friday → fetch Friday to Monday
            windowStart = today;
            windowEnd = today.plusDays(3);
        } else if (dow == DayOfWeek.SATURDAY) {
            // Saturday → fetch today to Monday
            windowStart = today;
            windowEnd = today.plusDays(2);
        } else if (dow == DayOfWeek.SUNDAY) {
            // Sunday → fetch today to Monday
            windowStart = today;
            windowEnd = today.plusDays(1);
        } else if (dow == DayOfWeek.MONDAY) {
            // Monday → fetch only today
            windowStart = today;
            windowEnd = today;
        } else {
            // Tue, Wed, Thu → fetch next Friday to Monday
            LocalDate nextFriday = today;
            while (nextFriday.getDayOfWeek() != DayOfWeek.FRIDAY) {
                nextFriday = nextFriday.plusDays(1);
            }
            windowStart = nextFriday;
            windowEnd = nextFriday.plusDays(3);
        }

        // Current window
        result.add(new Pair(windowStart, windowEnd));

        // Next week → always Friday to Monday, one week ahead of current window's Friday
        LocalDate currentFriday = windowEnd.minusDays(
            windowEnd.getDayOfWeek() == DayOfWeek.MONDAY ? 3 :
            windowEnd.getDayOfWeek() == DayOfWeek.SUNDAY ? 2 :
            windowEnd.getDayOfWeek() == DayOfWeek.SATURDAY ? 1 : 0
        );
        LocalDate nextFriday = currentFriday.plusDays(7);
        result.add(new Pair(nextFriday, nextFriday.plusDays(3)));

        return result;
    }
}