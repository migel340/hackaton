import type { Signal } from "@/api/signals";
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
            style={{ backgroundColor: signalTypeColors[signal.type] }}
          />
          <span className="badge badge-outline">{getTypeLabel(signal.type)}</span>
          <span className="badge badge-success">
            {Math.round(signal.match_score * 100)}% dopasowania
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-xl mb-2">{signal.title}</h3>

        {/* Author */}
        {signal.username && (
          <p className="text-sm text-base-content/70 mb-4">
            Autor: <span className="font-medium">{signal.username}</span>
          </p>
        )}

        {/* Description */}
        {signal.metadata.description && (
          <ModalSection title="Opis">
            <p className="text-base-content/80">{signal.metadata.description}</p>
          </ModalSection>
        )}

        {/* Investor specific */}
        {signal.type === "investor" &&
          signal.metadata.budget_min !== undefined && (
            <ModalSection title="Budżet">
              <p className="text-base-content/80">
                {signal.metadata.budget_min?.toLocaleString()} -{" "}
                {signal.metadata.budget_max?.toLocaleString()} PLN
              </p>
            </ModalSection>
          )}

        {/* Freelancer specific */}
        {signal.type === "freelancer" && (
          <>
            {signal.metadata.hourly_rate && (
              <ModalSection title="Stawka godzinowa">
                <p className="text-base-content/80">
                  {signal.metadata.hourly_rate} PLN/h
                </p>
              </ModalSection>
            )}
            {signal.metadata.skills && signal.metadata.skills.length > 0 && (
              <ModalSection title="Umiejętności">
                <BadgeList
                  items={signal.metadata.skills}
                  labels={skillLabels}
                  variant="primary"
                />
              </ModalSection>
            )}
          </>
        )}

        {/* Idea specific */}
        {signal.type === "idea" && (
          <>
            {signal.metadata.funding_min !== undefined && (
              <ModalSection title="Szukane finansowanie">
                <p className="text-base-content/80">
                  {signal.metadata.funding_min?.toLocaleString()} -{" "}
                  {signal.metadata.funding_max?.toLocaleString()} PLN
                </p>
              </ModalSection>
            )}
            {signal.metadata.needed_skills &&
              signal.metadata.needed_skills.length > 0 && (
                <ModalSection title="Wymagane umiejętności">
                  <BadgeList
                    items={signal.metadata.needed_skills}
                    labels={skillLabels}
                    variant="secondary"
                  />
                </ModalSection>
              )}
          </>
        )}

        {/* Categories */}
        {signal.metadata.categories && signal.metadata.categories.length > 0 && (
          <ModalSection title="Kategorie">
            <BadgeList
              items={signal.metadata.categories}
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
