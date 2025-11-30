import { useState } from "react";
import RadarChart from "@/components/RadarChart";
import type { Signal } from "@/api/signals";
import {
  useRadarData,
  RadarHeader,
  RadarFilterButtons,
  MatchesList,
  RadarLoadingState,
  RadarErrorState,
  SignalDetailsModal,
} from "@/feature/signals/radar";

const RadarPage = () => {
  // ... (logika hooków bez zmian)
  const {
    data,
    userSignals,
    selectedUserSignalId,
    setSelectedUserSignalId,
    loading,
    error,
    refetch,
  } = useRadarData();

  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);

  if (loading) return <RadarLoadingState />;
  if (error || !data)
    return <RadarErrorState error={error} onRetry={refetch} />;

  const filteredMatches = data.matches.filter((signal) =>
    filterType ? signal.type === filterType : true
  );

  return (
    <div className="fixed inset-0 ml-64 bg-base-100 overflow-hidden">
      {/* 1. WARSTWA RADARU (ZMODYFIKOWANA) */}
      {/* - absolute inset-0: Kontener zajmuje cały ekran.
          - p-8: Dodajemy padding (margines wewnętrzny) ok. 32px z każdej strony.
            To zapewnia "oddech", ale siatka dociągnie się do tego marginesu.
          - flex items-center justify-center: Centrowanie zawartości.
      */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        {/* USUNIĘTO scale-90. Teraz div zajmuje 100% dostępnego miejsca wewnątrz paddingu */}
        <div className="w-full h-full transition-all duration-500 ease-out">
          <RadarChart
            userSignal={data.user_signal}
            matches={filteredMatches}
            onSignalClick={setSelectedSignal}
            className="w-full h-full"
          />
        </div>
      </div>

      {/* 2. HEADER (Bez zmian) */}
      <div className="absolute top-0 left-0 w-full flex justify-center z-20 pointer-events-none pt-6">
        <div className="w-auto max-w-[90%] pointer-events-auto">
          <div className="bg-base-100/80 backdrop-blur-md shadow-xl rounded-2xl border border-base-content/10 px-6 py-4 flex items-center justify-center transition-all hover:bg-base-100/95 hover:shadow-2xl">
            <RadarHeader
              userSignal={data.user_signal}
              userSignals={userSignals}
              selectedUserSignalId={selectedUserSignalId}
              onUserSignalChange={setSelectedUserSignalId}
            />
          </div>
        </div>
      </div>

      {/* 3. FILTRY (Bez zmian) */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
        <RadarFilterButtons
          matches={data.matches}
          filterType={filterType}
          onFilterChange={setFilterType}
        />
      </div>

      {/* 4. LISTA DOPASOWAŃ (Bez zmian) */}
      <div className="absolute right-0 top-0 bottom-0 z-20 flex items-end pointer-events-none">
        <MatchesList
          matches={filteredMatches}
          onSignalClick={setSelectedSignal}
        />
      </div>

      <SignalDetailsModal
        signal={selectedSignal}
        onClose={() => setSelectedSignal(null)}
      />
    </div>
  );
};

export default RadarPage;
