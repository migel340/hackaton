import type { Signal } from "@/api/signals";
import { getSignalType } from "@/api/signals";
import { signalTypeLabels } from "@/feature/signals/signalSchema";
import { signalTypeTextColors } from "./signalTypeColors";

interface RadarHeaderProps {
  userSignal: Signal;
  userSignals: Signal[];
  selectedUserSignalId: number | null;
  onUserSignalChange: (id: number) => void;
}

export const RadarHeader = ({
  userSignal,
  userSignals,
  selectedUserSignalId,
  onUserSignalChange,
}: RadarHeaderProps) => {
  const signalType = getSignalType(userSignal);
  
  return (
    <div className="relative flex items-center justify-between gap-10 z-10">
      <div className="flex items-center gap-3 bg-base-100/80 backdrop-blur-sm rounded-lg px-4 py-2">
        <div>
          <h1 className="font-bold text-lg">Radar Dopasowań</h1>
          <p className="text-xs text-base-content/60">
            Kliknij sygnał, aby zobaczyć szczegóły
          </p>
        </div>
      </div>

      <div className="bg-base-100/80 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-3">
        <span className="text-sm font-medium">Twoja aktywność:</span>
        <select
          className="select select-sm select-bordered bg-base-100 min-w-[200px]"
          value={selectedUserSignalId || ""}
          onChange={(e) => onUserSignalChange(Number(e.target.value))}
        >
          {userSignals.map((signal) => {
            const type = getSignalType(signal);
            return (
              <option key={signal.id} value={signal.id}>
                {signalTypeLabels[type as keyof typeof signalTypeLabels]} -{" "}
                {signal.details.title}
              </option>
            );
          })}
        </select>
      </div>

      <div className="bg-base-100/80 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2">
        <span className="text-sm font-medium">Typ:</span>
        <span className={`badge ${signalTypeTextColors[signalType]}`}>
          {signalTypeLabels[signalType as keyof typeof signalTypeLabels]}
        </span>
      </div>
    </div>
  );
};
