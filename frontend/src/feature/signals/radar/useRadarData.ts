import { useState, useEffect, useCallback } from "react";
import { getMatchedSignals, getUserSignals, type Signal, type MatchedSignalsResponse } from "@/api/signals";

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
  const [selectedUserSignalId, setSelectedUserSignalId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserSignals = async () => {
      try {
        const signals = await getUserSignals();
        setUserSignals(signals);
        if (signals.length > 0 && !selectedUserSignalId) {
          setSelectedUserSignalId(signals[0].id);
        }
      } catch (err) {
        console.error("Error fetching user signals:", err);
      }
    };
    fetchUserSignals();
  }, []);

  // Pobierz dopasowania gdy zmieni się wybrany sygnał użytkownika
  const fetchData = useCallback(async () => {
    if (!selectedUserSignalId) return;

    try {
      setLoading(true);
      const matches = await getMatchedSignals(selectedUserSignalId);
      const selectedSignal = userSignals.find(s => s.id === selectedUserSignalId);
      
      if (selectedSignal) {
        setData({
          user_signal: selectedSignal,
          matches: matches,
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
