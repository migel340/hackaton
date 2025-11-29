import type { Signal } from "@/api/signals";
import { signalTypeLabels } from "@/feature/signals/signalSchema";
import { signalTypeBgColors } from "./signalTypeColors";

interface RadarFilterButtonsProps {
  matches: Signal[];
  filterType: string | null;
  onFilterChange: (type: string | null) => void;
}

export const RadarFilterButtons = ({
  matches,
  filterType,
  onFilterChange,
}: RadarFilterButtonsProps) => {
  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-base-100/80 backdrop-blur-sm rounded-full px-4 py-2">
      {/* All button */}
      <button
        className={`btn btn-sm btn-circle ${
          filterType === null ? "btn-primary" : "btn-ghost"
        }`}
        onClick={() => onFilterChange(null)}
        title="Wszystkie"
      >
        {matches.length}
      </button>

      {/* Type filter buttons */}
      {Object.entries(signalTypeLabels).map(([type, label]) => {
        const count = matches.filter((s) => s.type === type).length;
        const bgColor = signalTypeBgColors[type];
        
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
