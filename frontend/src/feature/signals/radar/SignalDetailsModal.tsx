import type { Signal } from "@/api/signals";
import { getSignalType } from "@/api/signals";
import {
  signalTypeLabels,
  categoryLabels,
  skillLabels,
} from "@/feature/signals/signalSchema";
import { signalTypeColors } from "./signalTypeColors";

interface SignalDetailsModalProps {
  signal: Signal | null;
  onClose: () => void;
}

export const SignalDetailsModal = ({
  signal,
  onClose,
}: SignalDetailsModalProps) => {
  if (!signal) return null;

  const signalType = getSignalType(signal);
  const getTypeLabel = (type: string) =>
    signalTypeLabels[type as keyof typeof signalTypeLabels] || type;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-lg">
        {/* Close button */}
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={onClose}
        >
          ✕
        </button>

        {/* Header badges */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: signalTypeColors[signalType] }}
          />
          <span className="badge badge-outline">{getTypeLabel(signalType)}</span>
          {signal.match_score !== undefined && (
            <span className="badge badge-success">
              {Math.round(signal.match_score * 100)}% dopasowania
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-xl mb-2">{signal.details.title}</h3>

        {/* Author */}
        {signal.username && (
          <p className="text-sm text-base-content/70 mb-4">
            Autor: <span className="font-medium">{signal.username}</span>
          </p>
        )}

        {/* Description */}
        {signal.details.description && (
          <ModalSection title="Opis">
            <p className="text-base-content/80">{signal.details.description}</p>
          </ModalSection>
        )}

        {/* Investor specific */}
        {signalType === "investor" &&
          signal.details.budget_min !== undefined && (
            <ModalSection title="Budżet">
              <p className="text-base-content/80">
                {signal.details.budget_min?.toLocaleString()} -{" "}
                {signal.details.budget_max?.toLocaleString()} PLN
              </p>
            </ModalSection>
          )}

        {/* Freelancer specific */}
        {signalType === "freelancer" && (
          <>
            {signal.details.hourly_rate && (
              <ModalSection title="Stawka godzinowa">
                <p className="text-base-content/80">
                  {signal.details.hourly_rate} PLN/h
                </p>
              </ModalSection>
            )}
            {signal.details.skills && signal.details.skills.length > 0 && (
              <ModalSection title="Umiejętności">
                <BadgeList
                  items={signal.details.skills}
                  labels={skillLabels}
                  variant="primary"
                />
              </ModalSection>
            )}
          </>
        )}

        {/* Idea specific */}
        {signalType === "idea" && (
          <>
            {signal.details.funding_min !== undefined && (
              <ModalSection title="Szukane finansowanie">
                <p className="text-base-content/80">
                  {signal.details.funding_min?.toLocaleString()} -{" "}
                  {signal.details.funding_max?.toLocaleString()} PLN
                </p>
              </ModalSection>
            )}
            {signal.details.needed_skills &&
              signal.details.needed_skills.length > 0 && (
                <ModalSection title="Wymagane umiejętności">
                  <BadgeList
                    items={signal.details.needed_skills}
                    labels={skillLabels}
                    variant="secondary"
                  />
                </ModalSection>
              )}
          </>
        )}

        {/* Categories */}
        {signal.details.categories && signal.details.categories.length > 0 && (
          <ModalSection title="Kategorie">
            <BadgeList
              items={signal.details.categories}
              labels={categoryLabels}
              variant="accent"
            />
          </ModalSection>
        )}

        {/* Actions */}
        <div className="modal-action">
          <button className="btn btn-primary">Skontaktuj się</button>
          <button className="btn btn-ghost" onClick={onClose}>
            Zamknij
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
};

// Helper components
interface ModalSectionProps {
  title: string;
  children: React.ReactNode;
}

const ModalSection = ({ title, children }: ModalSectionProps) => (
  <div className="mb-4">
    <h4 className="font-semibold mb-1">{title}</h4>
    {children}
  </div>
);

interface BadgeListProps {
  items: string[];
  labels: Record<string, string>;
  variant: "primary" | "secondary" | "accent";
}

const BadgeList = ({ items, labels, variant }: BadgeListProps) => (
  <div className="flex flex-wrap gap-2">
    {items.map((item) => (
      <span key={item} className={`badge badge-${variant} badge-outline`}>
        {labels[item as keyof typeof labels] || item}
      </span>
    ))}
  </div>
);
