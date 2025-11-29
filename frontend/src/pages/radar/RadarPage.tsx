import { useState, useEffect } from "react";
import RadarChart, { SignalDetailsModal } from "@/components/RadarChart";
import { getMatchedSignals, type Signal, type MatchedSignalsResponse } from "@/api/signals";
import { signalTypeLabels } from "@/feature/signals/signalSchema";

const signalTypeColors: Record<string, string> = {
  investor: "text-emerald-500",
  freelancer: "text-blue-500",
  idea: "text-amber-500",
};

const RadarPage = () => {
  const [data, setData] = useState<MatchedSignalsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getMatchedSignals();
        setData(response);
        setError(null);
      } catch (err) {
        setError("Nie udało się załadować dopasowań. Spróbuj ponownie.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredMatches = data?.matches.filter((signal) =>
    filterType ? signal.type === filterType : true
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="mt-4 text-base-content/70">Skanowanie radaru...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="alert alert-error max-w-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error || "Brak danych"}</span>
        </div>
        <button
          className="btn btn-primary mt-4"
          onClick={() => window.location.reload()}
        >
          Spróbuj ponownie
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-6rem)] gap-4">
      {/* Main Radar Section - Full Screen Focus */}
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-base-300 to-base-200 rounded-2xl p-4 relative">
        {/* Floating Header */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3 bg-base-100/80 backdrop-blur-sm rounded-lg px-4 py-2">
            <span className="text-2xl">🎯</span>
            <div>
              <h1 className="font-bold text-lg">Radar Dopasowań</h1>
              <p className="text-xs text-base-content/60">Kliknij sygnał, aby zobaczyć szczegóły</p>
            </div>
          </div>
          
          {/* Your Signal Badge */}
          <div className="bg-base-100/80 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2">
            <span className="text-sm font-medium">Twój sygnał:</span>
            <span className={`badge ${signalTypeColors[data.user_signal.type]}`}>
              {signalTypeLabels[data.user_signal.type as keyof typeof signalTypeLabels]}
            </span>
          </div>
        </div>

        {/* Radar Chart - Maximized */}
        <div className="flex-1 flex items-center justify-center w-full py-16">
          <RadarChart
            userSignal={data.user_signal}
            matches={filteredMatches || []}
            onSignalClick={setSelectedSignal}
            className="w-full max-w-[min(80vh,800px)]"
          />
        </div>

        {/* Filter Buttons - Bottom Floating */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-base-100/80 backdrop-blur-sm rounded-full px-4 py-2">
          <button
            className={`btn btn-sm btn-circle ${filterType === null ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setFilterType(null)}
            title="Wszystkie"
          >
            {data.matches.length}
          </button>
          {Object.entries(signalTypeLabels).map(([type, label]) => {
            const count = data.matches.filter((s) => s.type === type).length;
            const bgColor = type === "investor" ? "bg-emerald-500" : type === "freelancer" ? "bg-blue-500" : "bg-amber-500";
            return (
              <button
                key={type}
                className={`btn btn-sm ${filterType === type ? bgColor + " text-white" : "btn-ghost"}`}
                onClick={() => setFilterType(type)}
                title={label}
              >
                <span className={`w-2 h-2 rounded-full ${bgColor} ${filterType === type ? "bg-white" : ""}`}></span>
                {count}
              </button>
            );
          })}
        </div>
      </div>

      {/* Side Panel - Matches List */}
      <div className="lg:w-80 xl:w-96 bg-base-200 rounded-2xl p-4 overflow-hidden flex flex-col">
        <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
          <span>📋</span>
          Dopasowania
          <span className="badge badge-sm">{filteredMatches?.length || 0}</span>
        </h2>
        
        <div className="overflow-y-auto flex-1 space-y-2 pr-1">
          {filteredMatches?.sort((a, b) => b.match_score - a.match_score).map((signal) => (
            <div
              key={signal.id}
              className="card bg-base-100 hover:bg-base-300 cursor-pointer transition-all hover:scale-[1.02] shadow-sm"
              onClick={() => setSelectedSignal(signal)}
            >
              <div className="card-body p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor:
                          signal.type === "investor"
                            ? "#10b981"
                            : signal.type === "freelancer"
                            ? "#3b82f6"
                            : "#f59e0b",
                      }}
                    />
                    <span className="font-semibold text-sm truncate max-w-[140px]">{signal.title}</span>
                  </div>
                  <div className="badge badge-success badge-sm">
                    {Math.round(signal.match_score * 100)}%
                  </div>
                </div>
                {signal.username && (
                  <p className="text-xs text-base-content/60 mt-1">{signal.username}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Signal Details Modal */}
      <SignalDetailsModal signal={selectedSignal} onClose={() => setSelectedSignal(null)} />
    </div>
  );
};

export default RadarPage;
