import { useState } from "react";
import type { Signal } from "@/api/signals";
import { getSignalType, getSignalTitle } from "@/api/signals";
import {
  categoryLabels,
  skillLabels,
} from "@/feature/signals/signalSchema";
import { signalTypeColors } from "./signalTypeColors";
import { ChatWindow, useChatWebSocket } from "@/feature/chat";
import { useLanguage } from "@/i18n";

interface SignalDetailsModalProps {
  signal: Signal | null;
  onClose: () => void;
}

export const SignalDetailsModal = ({
  signal,
  onClose,
}: SignalDetailsModalProps) => {
  const [showChat, setShowChat] = useState(false);
  
  // WebSocket do wysyłania wiadomości
  const { isConnected, sendMessage: sendMessageViaWs } = useChatWebSocket({});
  const { t } = useLanguage();
  
  if (!signal) return null;

  const signalType = getSignalType(signal);
  
  const signalTypeLabels = {
    investor: t.investor,
    freelancer: t.freelancer,
    idea: t.idea,
  };
  
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
              {Math.round(signal.match_score * 100)}% {t.signalDetails.matchPercentage}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-xl mb-2">{getSignalTitle(signal.details)}</h3>

        {/* Author */}
        {signal.username && (
          <p className="text-sm text-base-content/70 mb-4">
            {t.signalDetails.author}: <span className="font-medium">{signal.username}</span>
          </p>
        )}

        {/* Description */}
        {signal.details?.description && (
          <ModalSection title={t.signalDetails.description}>
            <p className="text-base-content/80">{signal.details.description}</p>
          </ModalSection>
        )}

        {/* Investor specific - nowa struktura z backendu */}
        {signalType === "investor" && (
          <>
            {signal.details?.ticket_size && (
              <ModalSection title={t.signalDetails.ticketSize}>
                <p className="text-base-content/80">{signal.details.ticket_size}</p>
              </ModalSection>
            )}
            {signal.details?.stage && signal.details.stage.length > 0 && (
              <ModalSection title={t.signalDetails.stage}>
                <div className="flex flex-wrap gap-2">
                  {signal.details.stage.map((s) => (
                    <span key={s} className="badge badge-outline">{s}</span>
                  ))}
                </div>
              </ModalSection>
            )}
            {signal.details?.focus_areas && signal.details.focus_areas.length > 0 && (
              <ModalSection title={t.signalDetails.focusAreas}>
                <div className="flex flex-wrap gap-2">
                  {signal.details.focus_areas.map((area) => (
                    <span key={area} className="badge badge-accent badge-outline">{area}</span>
                  ))}
                </div>
              </ModalSection>
            )}
            {signal.details?.criteria && signal.details.criteria.length > 0 && (
              <ModalSection title={t.signalDetails.criteria}>
                <div className="flex flex-wrap gap-2">
                  {signal.details.criteria.map((c) => (
                    <span key={c} className="badge badge-secondary badge-outline">{c}</span>
                  ))}
                </div>
              </ModalSection>
            )}
            {signal.details?.looking_for && (
              <ModalSection title={t.signalDetails.lookingFor}>
                <p className="text-base-content/80">{signal.details.looking_for}</p>
              </ModalSection>
            )}
            {signal.details?.value_add && signal.details.value_add.length > 0 && (
              <ModalSection title={t.signalDetails.valueAdd}>
                <div className="flex flex-wrap gap-2">
                  {signal.details.value_add.map((v) => (
                    <span key={v} className="badge badge-primary badge-outline">{v}</span>
                  ))}
                </div>
              </ModalSection>
            )}
            {/* Stara struktura - budżet */}
            {signal.details?.budget_min !== undefined && (
              <ModalSection title={t.signalDetails.budget}>
                <p className="text-base-content/80">
                  {signal.details.budget_min?.toLocaleString()} -{" "}
                  {signal.details.budget_max?.toLocaleString()} PLN
                </p>
              </ModalSection>
            )}
          </>
        )}

        {/* Freelancer specific */}
        {signalType === "freelancer" && (
          <>
            {signal.details?.hourly_rate && (
              <ModalSection title={t.signalDetails.hourlyRate}>
                <p className="text-base-content/80">
                  {signal.details.hourly_rate} PLN/h
                </p>
              </ModalSection>
            )}
            {signal.details?.experience && (
              <ModalSection title={t.signalDetails.experience}>
                <p className="text-base-content/80">{signal.details.experience}</p>
              </ModalSection>
            )}
            {signal.details?.availability && (
              <ModalSection title={t.signalDetails.availability}>
                <p className="text-base-content/80">{signal.details.availability}</p>
              </ModalSection>
            )}
            {signal.details?.skills && signal.details.skills.length > 0 && (
              <ModalSection title={t.signalDetails.skills}>
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
            {signal.details?.problem && (
              <ModalSection title={t.signalDetails.problem}>
                <p className="text-base-content/80">{signal.details.problem}</p>
              </ModalSection>
            )}
            {signal.details?.solution && (
              <ModalSection title={t.signalDetails.solution}>
                <p className="text-base-content/80">{signal.details.solution}</p>
              </ModalSection>
            )}
            {signal.details?.market && (
              <ModalSection title={t.signalDetails.market}>
                <p className="text-base-content/80">{signal.details.market}</p>
              </ModalSection>
            )}
            {signal.details?.funding_min !== undefined && (
              <ModalSection title={t.signalDetails.fundingNeeded}>
                <p className="text-base-content/80">
                  {signal.details.funding_min?.toLocaleString()} -{" "}
                  {signal.details.funding_max?.toLocaleString()} PLN
                </p>
              </ModalSection>
            )}
            {signal.details?.needed_skills &&
              signal.details.needed_skills.length > 0 && (
                <ModalSection title={t.signalDetails.requiredSkills}>
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
        {signal.details?.categories && signal.details.categories.length > 0 && (
          <ModalSection title={t.signalDetails.categories}>
            <BadgeList
              items={signal.details.categories}
              labels={categoryLabels}
              variant="accent"
            />
          </ModalSection>
        )}

        {/* Actions */}
        <div className="modal-action">
          {signal.username && signal.user_id && (
            <button 
              className="btn btn-primary"
              onClick={() => setShowChat(true)}
            >
              {t.signalDetails.contact}
            </button>
          )}
          <button className="btn btn-ghost" onClick={onClose}>
            {t.signalDetails.close}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
      
      {/* Chat Window */}
      {showChat && signal.username && (
        <ChatWindow
          userId={signal.user_id || 0}
          username={signal.username}
          onClose={() => setShowChat(false)}
          onSendViaWs={isConnected ? sendMessageViaWs : undefined}
          signalType={signalType}
        />
      )}
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
