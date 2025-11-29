import type { Signal } from "@/api/signals";
import { signalTypeLabels } from "@/feature/signals/signalSchema";
import { signalTypeTextColors } from "./signalTypeColors";

interface RadarHeaderProps {
  userSignal: Signal;
  userSignals: Signal[];
  selectedUserSignalId: string | null;
  onUserSignalChange: (id: string) => void;
}

export const RadarHeader = ({
  userSignal,
  userSignals,
  selectedUserSignalId,
  onUserSignalChange,
}: RadarHeaderProps) => {
  return (
    <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 z-10">
      {/* Title */}
      <div className="flex items-center gap-3 bg-base-100/80 backdrop-blur-sm rounded-lg px-4 py-2">
        <span className="text-2xl">🎯</span>
        <div>
          <h1 className="font-bold text-lg">Radar Dopasowań</h1>
          <p className="text-xs text-base-content/60">
            Kliknij sygnał, aby zobaczyć szczegóły
          </p>
        </div>
      </div>

      {/* User Signal Selector */}
      <div className="bg-base-100/80 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-3">
        <span className="text-sm font-medium">Twoja aktywność:</span>
        <select
          className="select select-sm select-bordered bg-base-100 min-w-[200px]"
          value={selectedUserSignalId || ""}
          onChange={(e) => onUserSignalChange(e.target.value)}
        >
          {userSignals.map((signal) => (
            <option key={signal.id} value={signal.id}>
              {signalTypeLabels[signal.type as keyof typeof signalTypeLabels]} -{" "}
              {signal.title}
            </option>
          ))}
        </select>
      </div>

      {/* Current Signal Type Badge */}
      <div className="bg-base-100/80 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2">
        <span className="text-sm font-medium">Typ:</span>
        <span className={`badge ${signalTypeTextColors[userSignal.type]}`}>
          {signalTypeLabels[userSignal.type as keyof typeof signalTypeLabels]}
        </span>
      </div>
    </div>
  );
};
