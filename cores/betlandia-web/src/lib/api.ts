import type { Fixture, Market, MarketOdds, PlaceBetRequest, User, Bet } from "@/types";

const BASE = "/api";

function authHeaders(): HeadersInit {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("betlandia_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { ...authHeaders() },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

async function post<T>(path: string, body: unknown, requiresAuth = false): Promise<T> {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (requiresAuth) Object.assign(headers, authHeaders());
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `POST ${path} failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  fixtures: {
    list: () => get<Fixture[]>("/fixtures"),
    live: () => get<Fixture[]>("/fixtures/live"),
    get: (matchId: number) => get<Fixture>(`/fixtures/${matchId}`),
  },
  odds: {
    get: (fixtureId: number) => get<MarketOdds[]>(`/odds/${fixtureId}`),
  },
  markets: {
    get: (fixtureId: number) => get<Market[]>(`/markets/${fixtureId}`),
  },
  bets: {
    place: (req: PlaceBetRequest) => post("/bets", req, true),
    forUser: (userId: string) => get<Bet[]>(`/bets/${userId}`),
  },
  auth: {
    register: (username: string, email: string) =>
      post<{ token: string; user: User }>("/auth/register", { username, email }),
    login: (username: string) =>
      post<{ token: string }>("/auth/login", { username }),
  },
  users: {
    get: (id: string) => get<User>(`/users/${id}`),
    getByUsername: (username: string) => get<User>(`/users/by-username/${username}`),
  },
};
