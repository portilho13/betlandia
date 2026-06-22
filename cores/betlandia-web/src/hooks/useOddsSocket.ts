"use client";

import { useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import type { OddsUpdate } from "@/types";
import { useBetSlip } from "@/store/betSlipStore";

export function useOddsSocket(
  fixtureId: number | null,
  onUpdate: (update: OddsUpdate) => void
) {
  const clientRef = useRef<Client | null>(null);
  const updateOdds = useBetSlip((s) => s.updateOdds);

  useEffect(() => {
    if (!fixtureId) return;

    const wsUrl =
      (typeof window !== "undefined" && (window as any).__NEXT_PUBLIC_WS_URL) ||
      process.env.NEXT_PUBLIC_WS_URL ||
      "http://localhost:8080";

    const client = new Client({
      webSocketFactory: () => new SockJS(`${wsUrl}/ws/odds`),
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/odds/${fixtureId}`, (msg) => {
          try {
            const update: OddsUpdate = JSON.parse(msg.body);
            onUpdate(update);
            updateOdds(update.fixtureId, update.marketType, update.homeOdd, update.drawOdd, update.awayOdd);
          } catch {
            // malformed message
          }
        });
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [fixtureId]);
}
