import { useState, useEffect, useCallback } from "react";
import { getMatchedSignals, getUserSignals, type Signal, type MatchedSignalsResponse } from "@/api/signals";

interface UseRadarDataReturn {
  data: MatchedSignalsResponse | null;
  userSignals: Signal[];
  selectedUserSignalId: string | null;
  setSelectedUserSignalId: (id: string | null) => void;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useRadarData = (): UseRadarDataReturn => {
  const [data, setData] = useState<MatchedSignalsResponse | null>(null);
  const [userSignals, setUserSignals] = useState<Signal[]>([]);
  const [selectedUserSignalId, setSelectedUserSignalId] = useState<string | null>(null);
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
    if (!selectedUserSignalId && userSignals.length === 0) return;

    try {
      setLoading(true);
      const response = await getMatchedSignals(selectedUserSignalId || undefined);
      setData(response);
      setError(null);
    } catch (err) {
      setError("Nie udało się załadować dopasowań. Spróbuj ponownie.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedUserSignalId, userSignals.length]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
