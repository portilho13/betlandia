"use client";

import { create } from "zustand";
import type { BetSlipItem, BetSelection, MarketType } from "@/types";

interface BetSlipStore {
  items: BetSlipItem[];
  stake: string;
  addItem: (item: BetSlipItem) => void;
  removeItem: (marketId: string) => void;
  hasItem: (marketId: string, selection: BetSelection) => boolean;
  setStake: (s: string) => void;
  clear: () => void;
  updateOdds: (fixtureId: number, marketType: MarketType, homeOdd: number, drawOdd: number, awayOdd: number) => void;
}

export const useBetSlip = create<BetSlipStore>((set, get) => ({
  items: [],
  stake: "",

  addItem(item) {
    set((state) => {
      const exists = state.items.find((i) => i.marketId === item.marketId);
      if (exists) {
        if (exists.selection === item.selection) {
          return { items: state.items.filter((i) => i.marketId !== item.marketId) };
        }
        return { items: state.items.map((i) => i.marketId === item.marketId ? item : i) };
      }
      return { items: [...state.items, item] };
    });
  },

  removeItem(marketId) {
    set((state) => ({ items: state.items.filter((i) => i.marketId !== marketId) }));
  },

  hasItem(marketId, selection) {
    return get().items.some((i) => i.marketId === marketId && i.selection === selection);
  },

  setStake(s) {
    set({ stake: s });
  },

  clear() {
    set({ items: [], stake: "" });
  },

  updateOdds(fixtureId, marketType, homeOdd, drawOdd, awayOdd) {
    set((state) => ({
      items: state.items.map((item) => {
        if (item.fixtureId !== fixtureId || item.marketType !== marketType) return item;
        const newOdds =
          item.selection === "HOME" ? homeOdd :
          item.selection === "DRAW" ? drawOdd : awayOdd;
        return { ...item, odds: newOdds };
      }),
    }));
  },
}));
