import type { Signal } from "@/api/signals";
import { getSignalType } from "@/api/signals";
import { signalTypeBgColors } from "./signalTypeColors";
import { useLanguage } from "@/i18n";
import { useEffect, useRef } from "react";

interface RadarFilterButtonsProps {
  matches: Signal[];
  filterType: string | null;
  onFilterChange: (type: string | null) => void;
  baseSignalType: string;
}

export const RadarFilterButtons = ({
  matches,
  filterType,
  onFilterChange,
  baseSignalType,
}: RadarFilterButtonsProps) => {
  const { t } = useLanguage();
  
  const signalTypeLabels = {
    investor: t.investor,
    freelancer: t.freelancer,
    idea: t.idea,
  };

  // Policz ile typów ma count > 0
  const typesWithMatches = Object.keys(signalTypeLabels).filter(
    (type) => matches.filter((s) => getSignalType(s) === type).length > 0
  );
  const hasMultipleTypes = typesWithMatches.length > 1;
  const isIdeaBase = baseSignalType === "idea";

  // Jeśli użytkownik przełącza się na sygnał typu "idea", ustaw domyślnie filtr na "Wszystkie"
  const prevBaseRef = useRef<string | null>(null);
  useEffect(() => {
    const prevBase = prevBaseRef.current;
    if (baseSignalType === "idea" && prevBase !== "idea" && filterType !== null) {
      onFilterChange(null);
    }
    prevBaseRef.current = baseSignalType;
  }, [baseSignalType, filterType, onFilterChange]);
  
  return (
    <div className="flex gap-2 bg-base-200/90 backdrop-blur-sm rounded-full px-4 py-2">
      {/* All button - tylko dla sygnałów typu idea */}
      {isIdeaBase && (
        <button
          className={`btn btn-sm btn-circle ${
            filterType === null ? "btn-primary" : "btn-ghost"
          }`}
          onClick={() => onFilterChange(null)}
          title={t.all}
        >
          {matches.length}
        </button>
      )}

      {/* Type filter buttons - only show if count > 0 */}
      {Object.entries(signalTypeLabels).map(([type, label]) => {
        const count = matches.filter((s) => getSignalType(s) === type).length;
        const bgColor = signalTypeBgColors[type];
        
        // Nie pokazuj przycisku jeśli nie ma żadnych matchy tego typu
        if (count === 0) return null;
        
        return (
          <button
            key={type}
            className={`btn btn-sm ${
              filterType === type ? bgColor + " text-white" : "btn-ghost"
            }`}
            onClick={() => onFilterChange(type)}
            title={label}
          >
            <span
              className={`w-2 h-2 rounded-full ${bgColor} ${
                filterType === type ? "bg-white" : ""
              }`}
            />
            {count}
          </button>
        );
      })}
    </div>
  );
};
