import { createContext, useContext, useCallback, useState } from "react";
import api from "../services/api";
import { useAuth } from "./AuthContext";

const TripContext = createContext(null);

const ACTIVE_KEY = "activeTripId";

export function TripProvider({ children }) {
  const { user } = useAuth();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(false);

  const clearTrip = useCallback(() => {
    setTrip(null);
    localStorage.removeItem(ACTIVE_KEY);
  }, []);

  const loadTrip = useCallback(async () => {
    const id = localStorage.getItem(ACTIVE_KEY);
    if (!id) return null;
    try {
      const { data } = await api.get(`/trips/${id}`);
      setTrip(data.trip);
      return data.trip;
    } catch {
      clearTrip();
      return null;
    }
  }, [clearTrip]);

  const ensureTrip = useCallback(async () => {
    if (trip) return trip;
    const existing = await loadTrip();
    if (existing) return existing;
    const { data } = await api.post("/trips", {
      name: "My Chikkamagaluru Trip",
      travellers: 1,
      budget: 0,
    });
    localStorage.setItem(ACTIVE_KEY, data.trip._id);
    setTrip(data.trip);
    return data.trip;
  }, [trip, loadTrip]);

  const addDestination = useCallback(
    async (destinationId) => {
      setLoading(true);
      try {
        const current = await ensureTrip();
        const { data } = await api.post(`/trips/${current._id}/destinations`, {
          destinationId,
        });
        setTrip(data.trip);
        return data.trip;
      } finally {
        setLoading(false);
      }
    },
    [ensureTrip]
  );

  const removeDestination = useCallback(async (destinationId) => {
    const id = localStorage.getItem(ACTIVE_KEY);
    if (!id) return null;
    setLoading(true);
    try {
      const { data } = await api.delete(
        `/trips/${id}/destinations/${destinationId}`
      );
      setTrip(data.trip);
      return data.trip;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTrip = useCallback(async (patch) => {
    const id = localStorage.getItem(ACTIVE_KEY);
    if (!id) return null;
    const { data } = await api.put(`/trips/${id}`, patch);
    setTrip(data.trip);
    return data.trip;
  }, []);

  const startNewTrip = useCallback(async () => {
    const { data } = await api.post("/trips", {
      name: "My Chikkamagaluru Trip",
      travellers: 1,
      budget: 0,
    });
    localStorage.setItem(ACTIVE_KEY, data.trip._id);
    setTrip(data.trip);
    return data.trip;
  }, []);

  const setActiveTrip = useCallback((tripObj) => {
    localStorage.setItem(ACTIVE_KEY, tripObj._id);
    setTrip(tripObj);
  }, []);

  const hasDestination = useCallback(
    (destinationId) =>
      Boolean(trip?.destinations?.some((d) => d._id === destinationId)),
    [trip]
  );

  const value = {
    trip,
    loading,
    user,
    ensureTrip,
    loadTrip,
    addDestination,
    removeDestination,
    updateTrip,
    startNewTrip,
    setActiveTrip,
    clearTrip,
    hasDestination,
    setTrip,
  };

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTrip() {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error("useTrip must be used within TripProvider");
  return ctx;
}
