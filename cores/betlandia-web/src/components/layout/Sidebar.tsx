"use client";

import { useState } from "react";
import Link from "next/link";

const TOP_COMPETITIONS = [
  { name: "Camp. do Mundo", flag: "🌍" },
  { name: "Amigáveis - Selecções", flag: "🌍" },
  { name: "EUA - MLB", flag: "🇺🇸" },
  { name: "Japão - J-League", flag: "🇯🇵" },
  { name: "NBA", flag: "🇺🇸" },
  { name: "Champions League", flag: "🇪🇺" },
  { name: "Liga Portugal", flag: "🇵🇹" },
];

const SPORTS = [
  { name: "Futebol", icon: "⚽" },
  { name: "Basebol", icon: "⚾" },
  { name: "Basquetebol", icon: "🏀" },
  { name: "Andebol", icon: "🤾" },
  { name: "Artes Marciais", icon: "🥋" },
  { name: "Badminton", icon: "🏸" },
  { name: "Ciclismo", icon: "🚴" },
  { name: "Dardos", icon: "🎯" },
  { name: "Futebol Americano", icon: "🏈" },
  { name: "Futsal", icon: "⚽" },
  { name: "Hóquei no Gelo", icon: "🏒" },
  { name: "Rugby", icon: "🏉" },
  { name: "Ténis", icon: "🎾" },
  { name: "Voleibol", icon: "🏐" },
];

export function Sidebar() {
  const [expandedSport, setExpandedSport] = useState<string | null>("Futebol");
  const [search, setSearch] = useState("");

  return (
    <aside className="w-72 shrink-0 border-r border-brand-gray-border bg-white overflow-y-auto h-screen sticky top-0">
      <div className="p-3">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-text text-sm">🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Jogador, equipa, competição…"
            className="w-full pl-8 pr-3 py-2 rounded-lg bg-brand-gray text-sm outline-none focus:ring-2 focus:ring-brand-red/30 placeholder:text-brand-gray-text"
          />
        </div>
      </div>

      <div className="px-3 pb-2">
        <p className="text-xs font-bold text-brand-gray-text uppercase tracking-wide mb-2 px-1">
          Top competições
        </p>
        <ul>
          {TOP_COMPETITIONS.map((c) => (
            <li key={c.name}>
              <button className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-brand-gray text-brand-dark text-left">
                <span>{c.flag}</span>
                <span className="truncate">{c.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="px-3 py-2 border-t border-brand-gray-border">
        <p className="text-xs font-bold text-brand-gray-text uppercase tracking-wide mb-2 px-1">
          Desportos
        </p>
        <ul>
          {SPORTS.filter((s) => !search || s.name.toLowerCase().includes(search.toLowerCase())).map((sport) => (
            <li key={sport.name}>
              <button
                onClick={() => setExpandedSport(expandedSport === sport.name ? null : sport.name)}
                className="w-full flex items-center justify-between px-2 py-2 text-sm rounded hover:bg-brand-gray text-brand-dark"
              >
                <span className="flex items-center gap-2">
                  <span>{sport.icon}</span>
                  <span>{sport.name}</span>
                </span>
                <span className="text-xs text-brand-gray-text">
                  {expandedSport === sport.name ? "▲" : "▼"}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
