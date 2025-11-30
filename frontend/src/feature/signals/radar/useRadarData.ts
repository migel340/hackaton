import { useState, useEffect, useCallback } from "react";
import { getMatchedSignals, getUserSignals, type Signal, type MatchedSignalsResponse } from "@/api/signals";

const SELECTED_SIGNAL_KEY = "selectedUserSignalId";

interface UseRadarDataReturn {
  data: MatchedSignalsResponse | null;
  userSignals: Signal[];
  selectedUserSignalId: number | null;
  setSelectedUserSignalId: (id: number | null) => void;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useRadarData = (): UseRadarDataReturn => {
  const [data, setData] = useState<MatchedSignalsResponse | null>(null);
  const [userSignals, setUserSignals] = useState<Signal[]>([]);
  const [selectedUserSignalId, setSelectedUserSignalIdState] = useState<number | null>(() => {
    // Read from localStorage on init
    const stored = localStorage.getItem(SELECTED_SIGNAL_KEY);
    return stored ? Number(stored) : null;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Wrapper to also save to localStorage
  const setSelectedUserSignalId = useCallback((id: number | null) => {
    setSelectedUserSignalIdState(id);
    if (id !== null) {
      localStorage.setItem(SELECTED_SIGNAL_KEY, String(id));
    } else {
      localStorage.removeItem(SELECTED_SIGNAL_KEY);
    }
  }, []);

  useEffect(() => {
    const fetchUserSignals = async () => {
      try {
        const signals = await getUserSignals();
        setUserSignals(signals);
        
        // Check if stored signal ID exists in user's signals
        const storedId = localStorage.getItem(SELECTED_SIGNAL_KEY);
        const storedSignalId = storedId ? Number(storedId) : null;
        
        if (storedSignalId && signals.some(s => s.id === storedSignalId)) {
          // Use stored signal ID if it exists
          setSelectedUserSignalIdState(storedSignalId);
        } else if (signals.length > 0) {
          // Otherwise use first signal
          setSelectedUserSignalId(signals[0].id);
        }
      } catch (err) {
        console.error("Error fetching user signals:", err);
      }
    };
    fetchUserSignals();
  }, [setSelectedUserSignalId]);

  // Pobierz dopasowania gdy zmieni się wybrany sygnał użytkownika
  const fetchData = useCallback(async () => {
    if (!selectedUserSignalId) return;

    try {
      setLoading(true);
      const matchResponse = await getMatchedSignals(selectedUserSignalId);
      
      // Użyj source_signal_id z odpowiedzi API do znalezienia sygnału źródłowego
      const sourceSignalId = matchResponse.source_signal_id;
      const selectedSignal = userSignals.find(s => s.id === sourceSignalId);
      
      if (selectedSignal) {
        setData({
          user_signal: selectedSignal,
          matches: matchResponse,
        });
      }
      setError(null);
    } catch (err) {
      setError("Nie udało się załadować dopasowań. Spróbuj ponownie.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedUserSignalId, userSignals]);

  useEffect(() => {
    if (selectedUserSignalId && userSignals.length > 0) {
      fetchData();
    }
  }, [fetchData, selectedUserSignalId, userSignals.length]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    userSignals,
    selectedUserSignalId,
    setSelectedUserSignalId,
    loading,
    error,
    refetch,
  };
};
