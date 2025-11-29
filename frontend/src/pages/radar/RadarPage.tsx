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

  if (loading) {
    return <RadarLoadingState />;
  }

  if (error || !data) {
    return <RadarErrorState error={error} onRetry={refetch} />;
  }

  const filteredMatches = data.matches.filter((signal) =>
    filterType ? signal.type === filterType : true
  );

  return (
    <div className="fixed inset-0 ml-64">
      {/* Header - absolute positioned */}
      <div className="absolute top-4 left-4 z-10">
        <RadarHeader
          userSignal={data.user_signal}
          userSignals={userSignals}
          selectedUserSignalId={selectedUserSignalId}
          onUserSignalChange={setSelectedUserSignalId}
        />
      </div>

      {/* Full-screen Radar chart */}
      <RadarChart
        userSignal={data.user_signal}
        matches={filteredMatches}
        onSignalClick={setSelectedSignal}
        className="w-full h-full"
      />

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
        <RadarFilterButtons
          matches={data.matches}
          filterType={filterType}
          onFilterChange={setFilterType}
        />
      </div>
      
      <div className="absolute right-0 top-20 bottom-24 flex items-stretch">
        <MatchesList matches={filteredMatches} onSignalClick={setSelectedSignal} />
      </div>

      <SignalDetailsModal
        signal={selectedSignal}
        onClose={() => setSelectedSignal(null)}
      />
    </div>
  );
};

export default RadarPage;
