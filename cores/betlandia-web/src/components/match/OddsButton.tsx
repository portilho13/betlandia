"use client";

import { useBetSlip } from "@/store/betSlipStore";
import type { BetSelection, MarketType } from "@/types";

interface Props {
  label: string;
  odds: number;
  selection: BetSelection;
  marketId: string;
  marketType: MarketType;
  fixtureId: number;
  homeTeam: string;
  awayTeam: string;
  disabled?: boolean;
}

export function OddsButton({
  label,
  odds,
  selection,
  marketId,
  marketType,
  fixtureId,
  homeTeam,
  awayTeam,
  disabled,
}: Props) {
  const addItem = useBetSlip((s) => s.addItem);
  const hasItem = useBetSlip((s) => s.hasItem);
  const active = hasItem(marketId, selection);

  return (
    <button
      onClick={() =>
        addItem({ marketId, fixtureId, homeTeam, awayTeam, marketType, selection, odds, label })
      }
      disabled={disabled}
      className={`flex flex-col items-center justify-center rounded px-3 py-2 text-sm font-bold min-w-[90px] transition-all
        ${disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" :
          active
            ? "bg-brand-dark text-brand-yellow ring-2 ring-brand-yellow"
            : "bg-brand-yellow hover:bg-brand-yellow-hover text-brand-dark"
        }`}
    >
      <span className="text-xs font-normal opacity-70">{label}</span>
      <span>{odds.toFixed(2)}</span>
    </button>
  );
}
