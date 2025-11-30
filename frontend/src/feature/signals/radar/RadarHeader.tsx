import type { Signal } from "@/api/signals";
import { getSignalType } from "@/api/signals";
import { signalTypeTextColors } from "./signalTypeColors";
import { useLanguage } from "@/i18n";

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
  const { t } = useLanguage();
  const signalType = getSignalType(userSignal);
  
  const signalTypeLabels = {
    investor: t.investor,
    freelancer: t.freelancer,
    idea: t.idea,
  };
  
  return (
    <div className="relative flex items-center justify-between gap-10 z-10">
      <div className="flex items-center gap-3 bg-base-100/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-base-content/20 shadow-md">
        <div>
          <h1 className="font-bold text-lg">{t.radarTitle}</h1>
          <p className="text-xs text-base-content/60">
            {t.radarSubtitle}
          </p>
        </div>
      </div>

      <div className="bg-base-100/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-base-content/20 shadow-md flex items-center gap-3">
        <span className="text font-medium whitespace-nowrap">{t.yourActivity}</span>
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

      <div className="bg-base-100/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-base-content/20 shadow-md flex items-center gap-2">
        <span className="text-sm font-medium">{t.type}</span>
        <span className={`badge ${signalTypeTextColors[signalType]}`}>
          {signalTypeLabels[signalType as keyof typeof signalTypeLabels]}
        </span>
      </div>
    </div>
  );
};
