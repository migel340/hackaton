import { useState } from "react";
import type { Signal } from "@/api/signals";
import { getSignalType, getSignalTitle } from "@/api/signals";
import { signalTypeColors } from "./signalTypeColors";

interface MatchesListProps {
  matches: Signal[];
  onSignalClick: (signal: Signal) => void;
}

export const MatchesList = ({ matches, onSignalClick }: MatchesListProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const sortedMatches = [...matches].sort(
    (a, b) => (b.match_score ?? 0) - (a.match_score ?? 0)
  );

  return (
    // ZMIANA 1: Ustawienie kontenera.
    // justify-end: spycha treść w dół.
    // pb-20: dodaje odstęp od samego dołu (żeby nie dotykało krawędzi).
    // pointer-events-none: pozwala klikać w "puste" miejsce nad listą (przydatne przy mapach/radarze).
    <div className="relative h-full flex flex-col justify-end pb-15 pointer-events-none">
      {/* ZMIANA 2: Wrapper dla Listy i Przycisku.
          Ustalamy tu konkretną wysokość (np. 65% ekranu - h-[65vh]),
          dzięki czemu lista jest "lekko zmniejszona".
          pointer-events-auto przywraca klikalność dla tego obszaru. */}
      <div className="relative flex items-center h-[75vh] pointer-events-auto">
        <button
          onClick={() => setIsOpen(!isOpen)}
          // Przycisk jest teraz pozycjonowany względem naszego wrappera h-[65vh]
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full z-20 btn btn-sm bg-base-200 hover:bg-base-300 border-0 rounded-l-lg rounded-r-none h-24 px-2 shadow-lg"
          title={isOpen ? "Zamknij listę" : "Otwórz listę dopasowań"}
        >
          <span className="text-lg">{isOpen ? "›" : "‹"}</span>
        </button>

        <div
          className={`h-full transition-all duration-300 ease-in-out overflow-hidden ${
            isOpen ? "w-80 xl:w-96" : "w-0"
          }`}
        >
          {/* Dodano rounded-l-2xl dla ładniejszego efektu "pływającego" panelu */}
          <div className="w-80 xl:w-96 h-full bg-base-200/95 backdrop-blur-sm p-4 flex flex-col rounded-l-2xl shadow-xl border-l border-base-300">
            {/* Header */}
            <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
              Dopasowania
              <span className="badge badge-sm">{matches.length}</span>
            </h2>

            {/* Matches list */}
            <div className="overflow-y-auto flex-1 space-y-2 pr-1 custom-scrollbar">
              {sortedMatches.map((signal) => (
                <MatchCard
                  key={signal.id}
                  signal={signal}
                  onClick={() => onSignalClick(signal)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface MatchCardProps {
  signal: Signal;
  onClick: () => void;
}

const MatchCard = ({ signal, onClick }: MatchCardProps) => {
  const signalType = getSignalType(signal);
  const title = getSignalTitle(signal.details);
  
  return (
    <div
      className="card bg-base-100 hover:bg-base-300 cursor-pointer transition-all hover:scale-[1.02] shadow-sm border border-base-200"
      onClick={onClick}
    >
      <div className="card-body p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: signalTypeColors[signalType] }}
            />
            <span className="font-semibold text-sm truncate max-w-[140px]">
              {title}
            </span>
          </div>
          {signal.match_score !== undefined && (
            <div className="badge badge-success badge-sm">
              {Math.round(signal.match_score * 100)}%
            </div>
          )}
        </div>
        {signal.username && (
          <p className="text-xs text-base-content/60 mt-1 pl-5">
            {signal.username}
          </p>
        )}
      </div>
    </div>
  );
};
