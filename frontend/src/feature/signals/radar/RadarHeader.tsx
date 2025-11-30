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
    <div className="flex items-center gap-4">
      {/* Tytuł */}
      <div className="text-center">
        <h1 className="font-bold text-base">{t.radarTitle}</h1>
        <p className="text-xs text-base-content/60">
          {t.radarSubtitle}
        </p>
      </div>

      <div className="w-px h-8 bg-base-content/20" />

      {/* Aktywność */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{t.yourActivity}</span>
        <select
          className="select select-sm select-bordered bg-base-100 w-48"
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

      <div className="w-px h-8 bg-base-content/20" />

      {/* Typ */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{t.type}</span>
        <span className={`badge badge-sm whitespace-nowrap ${signalTypeTextColors[signalType]}`}>
          {signalTypeLabels[signalType as keyof typeof signalTypeLabels]}
        </span>
      </div>
    </div>
  );
};
