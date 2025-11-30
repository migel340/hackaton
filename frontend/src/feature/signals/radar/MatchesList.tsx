import { useState, useEffect } from "react";
import type { Signal } from "@/api/signals";
import { getSignalType, getSignalTitle } from "@/api/signals";
import { signalTypeColors } from "./signalTypeColors";
import { signalTypeLabels } from "@/feature/signals/signalSchema";
import { useLanguage } from "@/i18n";
import { formatMatchPercentage } from "@/feature/signals/radar/formatMatchPercentage";

interface MatchesListProps {
  matches: Signal[];
  onSignalFocus: (signal: Signal) => void;
  onSignalDetails: (signal: Signal) => void;
}

export const MatchesList = ({ matches, onSignalFocus, onSignalDetails }: MatchesListProps) => {
  // Automatycznie otwieramy panel jeśli są dopasowania

  // Aktualizuj stan otwarcia gdy zmieni się liczba dopasowań
  useEffect(() => {
    setIsOpen(matches.length > 0);
  }, [matches.length]);

  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(matches.length > 0);
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
          title={isOpen ? t.closeList : t.openMatchList}
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
              {t.matches}
              <span className="badge badge-sm">{matches.length}</span>
            </h2>

            {/* Matches list */}
            <div className="overflow-y-auto flex-1 space-y-2 pr-1 custom-scrollbar">
              {sortedMatches.map((signal) => (
                <MatchCard
                  key={signal.id}
                  signal={signal}
                  onFocus={() => onSignalFocus(signal)}
                  onDetails={() => onSignalDetails(signal)}
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
  onFocus: () => void;
  onDetails: () => void;
}

const MatchCard = ({ signal, onFocus, onDetails }: MatchCardProps) => {
  const signalType = getSignalType(signal);
  const title = getSignalTitle(signal.details);
  const { t } = useLanguage();

  // Brief info based on signal type
  const description = signal.details?.description;
  const skills = signal.details?.skills;
  const categories = signal.details?.categories;
  const focusAreas = signal.details?.focus_areas;
  const ticketSize = signal.details?.ticket_size;
  const fundingNeeded = signal.details?.funding_needed;

  return (
    <div
      className="card bg-base-100 hover:bg-base-300 cursor-pointer transition-all hover:scale-[1.02] shadow-sm border border-base-200"
      onClick={onFocus}
    >
      <div className="card-body p-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: signalTypeColors[signalType] }}
            />
            <span className="text-xs text-base-content/60">
              {signalTypeLabels[signalType]}
            </span>
          </div>
          {signal.match_score !== undefined && (
            <div className="badge badge-success badge-sm">
              {formatMatchPercentage(signal.match_score)}%
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-sm mt-1 line-clamp-1">
          {title}
        </h3>

        {/* Username */}
        {signal.username && (
          <p className="text-xs text-base-content/60">
            @{signal.username}
          </p>
        )}

        {/* Brief - description */}
        {description && (
          <p className="text-xs text-base-content/70 mt-1 line-clamp-2">
            {description}
          </p>
        )}

        {/* Skills/Categories badges */}
        {(skills?.length || categories?.length || focusAreas?.length) && (
          <div className="flex flex-wrap gap-1 mt-2">
            {skills?.slice(0, 3).map((skill) => (
              <span key={skill} className="badge badge-xs badge-primary">
                {skill}
              </span>
            ))}
            {categories?.slice(0, 2).map((cat) => (
              <span key={cat} className="badge badge-xs badge-accent">
                {cat}
              </span>
            ))}
            {focusAreas?.slice(0, 2).map((area) => (
              <span key={area} className="badge badge-xs badge-info">
                {area}
              </span>
            ))}
          </div>
        )}

        {/* Funding info */}
        {(ticketSize || fundingNeeded) && (
          <p className="text-xs font-medium text-primary mt-1">
            💰 {ticketSize || fundingNeeded}
          </p>
        )}

      </div>
    </div>
  );
};
