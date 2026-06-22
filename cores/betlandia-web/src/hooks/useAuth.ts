"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export function useAuth() {
  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function loadUserProfile(name: string) {
    api.users.getByUsername(name).then((user) => {
      localStorage.setItem("betlandia_user_id", user.id);
      setUserId(user.id);
      setBalance(user.walletBalance);
    }).catch(() => {});
  }

  function refreshBalance() {
    const id = userId ?? localStorage.getItem("betlandia_user_id");
    if (!id) return;
    api.users.get(id).then((user) => {
      setBalance(user.walletBalance);
    }).catch(() => {});
  }

  useEffect(() => {
    const stored = localStorage.getItem("betlandia_username");
    const storedId = localStorage.getItem("betlandia_user_id");
    if (stored) setUsername(stored);
    if (storedId) {
      setUserId(storedId);
      api.users.get(storedId).then((user) => {
        setBalance(user.walletBalance);
      }).catch(() => {});
    }

    if (stored && !storedId) {
      loadUserProfile(stored);
    }
  }, []);

  async function register(name: string, email: string) {
    setLoading(true);
    setError(null);
    try {
      const data = await api.auth.register(name, email);
      localStorage.setItem("betlandia_token", data.token);
      localStorage.setItem("betlandia_username", name);
      const user = typeof data.user === "string" ? JSON.parse(data.user) : data.user;
      if (user?.id) {
        localStorage.setItem("betlandia_user_id", user.id);
        setUserId(user.id);
        setBalance(user.walletBalance ?? 50);
      }
      setUsername(name);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function login(name: string) {
    setLoading(true);
    setError(null);
    try {
      const { token } = await api.auth.login(name);
      localStorage.setItem("betlandia_token", token);
      localStorage.setItem("betlandia_username", name);
      setUsername(name);

      const user = await api.users.getByUsername(name);
      localStorage.setItem("betlandia_user_id", user.id);
      setUserId(user.id);
      setBalance(user.walletBalance);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("betlandia_token");
    localStorage.removeItem("betlandia_username");
    localStorage.removeItem("betlandia_user_id");
    setUsername(null);
    setUserId(null);
    setBalance(null);
  }

  const isLoggedIn = !!username;
  return { username, userId, balance, isLoggedIn, loading, error, register, login, logout, refreshBalance };
}
