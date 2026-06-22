export type FixtureStatus =
  | "SCHEDULED"
  | "LIVE"
  | "IN_PLAY"
  | "PAUSED"
  | "FINISHED"
  | "POSTPONED"
  | "SUSPENDED"
  | "CANCELLED";

export interface Fixture {
  id: string;
  matchId: number;
  homeTeam: string;
  awayTeam: string;
  gameDate: string;
  status: FixtureStatus;
  homeScore: number | null;
  awayScore: number | null;
  createdAt: string;
  updatedAt: string;
}

export type MarketType = "MATCH_WINNER" | "BTTS" | "OVER_UNDER";
export type MarketStatus = "OPEN" | "SUSPENDED" | "CLOSED";

export interface Market {
  id: string;
  fixtureId: number;
  type: MarketType;
  status: MarketStatus;
  createdAt: string;
}

export interface MarketOdds {
  id: string;
  fixtureId: number;
  marketType: MarketType;
  homeOdd: number;
  drawOdd: number;
  awayOdd: number;
  updatedAt: string;
}

export interface OddsUpdate {
  fixtureId: number;
  homeTeam: string | null;
  awayTeam: string | null;
  homeOdd: number;
  drawOdd: number;
  awayOdd: number;
  marketType: MarketType;
  updatedAt: string;
}

export type BetSelection = "HOME" | "DRAW" | "AWAY";
export type BetStatus = "PENDING" | "WON" | "LOST" | "VOID";

export interface BetSlipItem {
  marketId: string;
  fixtureId: number;
  homeTeam: string;
  awayTeam: string;
  marketType: MarketType;
  selection: BetSelection;
  odds: number;
  label: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  walletBalance: number;
  createdAt: string;
}

export interface PlaceBetRequest {
  userId: string;
  marketId: string;
  selection: BetSelection;
  stake: number;
  requestedOdds: number;
}

export interface Bet {
  id: string;
  userId: string;
  marketId: string;
  selection: BetSelection;
  oddsAtPlacement: number;
  stake: number;
  potentialPayout: number;
  status: BetStatus;
  placedAt: string;
}
