import { useRef, useEffect, useState, useCallback } from "react";
import type { Signal } from "@/api/signals";
import { signalTypeLabels, categoryLabels, skillLabels } from "@/feature/signals/signalSchema";

interface RadarChartProps {
  userSignal: Signal;
  matches: Signal[];
  onSignalClick?: (signal: Signal) => void;
  className?: string;
}

interface BlipPosition {
  signal: Signal;
  x: number;
  y: number;
  angle: number;
}

const signalTypeColors: Record<string, string> = {
  investor: "#10b981", // emerald-500
  freelancer: "#3b82f6", // blue-500
  idea: "#f59e0b", // amber-500
};

const signalTypeColorsHover: Record<string, string> = {
  investor: "#34d399", // emerald-400
  freelancer: "#60a5fa", // blue-400
  idea: "#fbbf24", // amber-400
};

const RadarChart = ({ userSignal, matches, onSignalClick, className = "" }: RadarChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 600 });
  const [hoveredSignal, setHoveredSignal] = useState<Signal | null>(null);
  const [blipPositions, setBlipPositions] = useState<BlipPosition[]>([]);
  const animationRef = useRef<number>(0);
  const sweepAngleRef = useRef(0);

  // Responsive sizing
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight || containerWidth;
        const size = Math.min(containerWidth, containerHeight, 800);
        setDimensions({ width: size, height: size });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Calculate blip positions
  useEffect(() => {
    const { width, height } = dimensions;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) / 2 - 40;

    const positions: BlipPosition[] = matches.map((signal, index) => {
      // Odległość od środka jest odwrotnością match_score
      // match_score = 1.0 -> blisko środka, match_score = 0.0 -> na krawędzi
      const distanceRatio = 1 - signal.match_score;
      const distance = distanceRatio * maxRadius * 0.9 + maxRadius * 0.1; // Min 10% od centrum

      // Rozmieść równomiernie pod różnymi kątami z pewnym losowym odchyleniem
      const baseAngle = (index / matches.length) * 2 * Math.PI;
      const angleOffset = (Math.random() - 0.5) * 0.3; // Lekkie losowe rozrzucenie
      const angle = baseAngle + angleOffset;

      return {
        signal,
        x: centerX + distance * Math.cos(angle),
        y: centerY + distance * Math.sin(angle),
        angle,
      };
    });

    setBlipPositions(positions);
  }, [matches, dimensions]);

  // Draw radar
  const drawRadar = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = dimensions;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) / 2 - 40;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background
    ctx.fillStyle = "#0f172a"; // slate-900
    ctx.beginPath();
    ctx.arc(centerX, centerY, maxRadius + 20, 0, 2 * Math.PI);
    ctx.fill();

    // Draw radar rings (concentric circles representing match levels)
    const ringCount = 5;
    for (let i = 1; i <= ringCount; i++) {
      const radius = (i / ringCount) * maxRadius;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = `rgba(34, 197, 94, ${0.15 + (ringCount - i) * 0.05})`; // green tint
      ctx.lineWidth = 1;
      ctx.stroke();

      // Add percentage labels on rings
      if (i < ringCount) {
        const percent = Math.round((1 - i / ringCount) * 100);
        ctx.fillStyle = "rgba(34, 197, 94, 0.5)";
        ctx.font = "10px sans-serif";
        ctx.fillText(`${percent}%`, centerX + radius + 5, centerY - 5);
      }
    }

    // Draw cross lines
    ctx.strokeStyle = "rgba(34, 197, 94, 0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX - maxRadius, centerY);
    ctx.lineTo(centerX + maxRadius, centerY);
    ctx.moveTo(centerX, centerY - maxRadius);
    ctx.lineTo(centerX, centerY + maxRadius);
    // Diagonal lines
    const diagOffset = maxRadius * Math.cos(Math.PI / 4);
    ctx.moveTo(centerX - diagOffset, centerY - diagOffset);
    ctx.lineTo(centerX + diagOffset, centerY + diagOffset);
    ctx.moveTo(centerX + diagOffset, centerY - diagOffset);
    ctx.lineTo(centerX - diagOffset, centerY + diagOffset);
    ctx.stroke();

    // Draw sweep line (animated)
    sweepAngleRef.current += 0.01;
    if (sweepAngleRef.current > 2 * Math.PI) {
      sweepAngleRef.current = 0;
    }

    const gradient = ctx.createLinearGradient(
      centerX,
      centerY,
      centerX + maxRadius * Math.cos(sweepAngleRef.current),
      centerY + maxRadius * Math.sin(sweepAngleRef.current)
    );
    gradient.addColorStop(0, "rgba(34, 197, 94, 0.6)");
    gradient.addColorStop(1, "rgba(34, 197, 94, 0)");

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, maxRadius, sweepAngleRef.current - 0.3, sweepAngleRef.current);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw blips (matched signals)
    blipPositions.forEach(({ signal, x, y }) => {
      const isHovered = hoveredSignal?.id === signal.id;
      const blipRadius = isHovered ? 12 : 8;
      const color = isHovered
        ? signalTypeColorsHover[signal.type]
        : signalTypeColors[signal.type];

      // Glow effect
      const glow = ctx.createRadialGradient(x, y, 0, x, y, blipRadius * 2);
      glow.addColorStop(0, color);
      glow.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.arc(x, y, blipRadius * 2, 0, 2 * Math.PI);
      ctx.fillStyle = glow;
      ctx.fill();

      // Main blip
      ctx.beginPath();
      ctx.arc(x, y, blipRadius, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();

      // Border
      ctx.strokeStyle = isHovered ? "#fff" : "rgba(255,255,255,0.3)";
      ctx.lineWidth = isHovered ? 2 : 1;
      ctx.stroke();

      // Match score text for hovered blip
      if (isHovered) {
        ctx.fillStyle = "#fff";
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`${Math.round(signal.match_score * 100)}%`, x, y - 18);
        ctx.fillText(signal.title.substring(0, 20), x, y + 25);
      }
    });

    // Draw user signal in center
    const userColor = signalTypeColors[userSignal.type];
    
    // User glow
    const userGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 30);
    userGlow.addColorStop(0, userColor);
    userGlow.addColorStop(0.5, `${userColor}66`);
    userGlow.addColorStop(1, "transparent");
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
    ctx.fillStyle = userGlow;
    ctx.fill();

    // User blip
    ctx.beginPath();
    ctx.arc(centerX, centerY, 15, 0, 2 * Math.PI);
    ctx.fillStyle = userColor;
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.stroke();

    // "TY" label
    ctx.fillStyle = "#fff";
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("TY", centerX, centerY);

    // Request next frame
    animationRef.current = requestAnimationFrame(drawRadar);
  }, [dimensions, blipPositions, hoveredSignal, userSignal]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(drawRadar);
    return () => cancelAnimationFrame(animationRef.current);
  }, [drawRadar]);

  // Handle mouse events
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if mouse is over any blip
    const hoveredBlip = blipPositions.find(({ x: bx, y: by }) => {
      const distance = Math.sqrt((x - bx) ** 2 + (y - by) ** 2);
      return distance < 15;
    });

    setHoveredSignal(hoveredBlip?.signal || null);
    canvas.style.cursor = hoveredBlip ? "pointer" : "default";
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !onSignalClick) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedBlip = blipPositions.find(({ x: bx, y: by }) => {
      const distance = Math.sqrt((x - bx) ** 2 + (y - by) ** 2);
      return distance < 15;
    });

    if (clickedBlip) {
      onSignalClick(clickedBlip.signal);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredSignal(null)}
        onClick={handleClick}
        className="rounded-full shadow-2xl"
      />
      
      {/* Legend */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4 bg-base-300/90 px-4 py-2 rounded-lg backdrop-blur-sm">
        {Object.entries(signalTypeLabels).map(([type, label]) => (
          <div key={type} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: signalTypeColors[type] }}
            />
            <span className="text-sm text-base-content">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RadarChart;

// Signal Details Modal Component
interface SignalDetailsModalProps {
  signal: Signal | null;
  onClose: () => void;
}

export const SignalDetailsModal = ({ signal, onClose }: SignalDetailsModalProps) => {
  if (!signal) return null;

  const getTypeLabel = (type: string) => signalTypeLabels[type as keyof typeof signalTypeLabels] || type;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-lg">
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={onClose}
        >
          ✕
        </button>
        
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: signalTypeColors[signal.type] }}
          />
          <span className="badge badge-outline">{getTypeLabel(signal.type)}</span>
          <span className="badge badge-success">{Math.round(signal.match_score * 100)}% dopasowania</span>
        </div>

        <h3 className="font-bold text-xl mb-2">{signal.title}</h3>
        
        {signal.username && (
          <p className="text-sm text-base-content/70 mb-4">
            Autor: <span className="font-medium">{signal.username}</span>
          </p>
        )}

        {signal.metadata.description && (
          <div className="mb-4">
            <h4 className="font-semibold mb-1">Opis</h4>
            <p className="text-base-content/80">{signal.metadata.description}</p>
          </div>
        )}

        {/* Investor specific */}
        {signal.type === "investor" && signal.metadata.budget_min !== undefined && (
          <div className="mb-4">
            <h4 className="font-semibold mb-1">Budżet</h4>
            <p className="text-base-content/80">
              {signal.metadata.budget_min?.toLocaleString()} - {signal.metadata.budget_max?.toLocaleString()} PLN
            </p>
          </div>
        )}

        {/* Freelancer specific */}
        {signal.type === "freelancer" && (
          <>
            {signal.metadata.hourly_rate && (
              <div className="mb-4">
                <h4 className="font-semibold mb-1">Stawka godzinowa</h4>
                <p className="text-base-content/80">{signal.metadata.hourly_rate} PLN/h</p>
              </div>
            )}
            {signal.metadata.skills && signal.metadata.skills.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold mb-1">Umiejętności</h4>
                <div className="flex flex-wrap gap-2">
                  {signal.metadata.skills.map((skill) => (
                    <span key={skill} className="badge badge-primary badge-outline">
                      {skillLabels[skill as keyof typeof skillLabels] || skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Idea specific */}
        {signal.type === "idea" && (
          <>
            {signal.metadata.funding_min !== undefined && (
              <div className="mb-4">
                <h4 className="font-semibold mb-1">Szukane finansowanie</h4>
                <p className="text-base-content/80">
                  {signal.metadata.funding_min?.toLocaleString()} - {signal.metadata.funding_max?.toLocaleString()} PLN
                </p>
              </div>
            )}
            {signal.metadata.needed_skills && signal.metadata.needed_skills.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold mb-1">Wymagane umiejętności</h4>
                <div className="flex flex-wrap gap-2">
                  {signal.metadata.needed_skills.map((skill) => (
                    <span key={skill} className="badge badge-secondary badge-outline">
                      {skillLabels[skill as keyof typeof skillLabels] || skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Categories */}
        {signal.metadata.categories && signal.metadata.categories.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold mb-1">Kategorie</h4>
            <div className="flex flex-wrap gap-2">
              {signal.metadata.categories.map((category) => (
                <span key={category} className="badge badge-accent badge-outline">
                  {categoryLabels[category as keyof typeof categoryLabels] || category}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="modal-action">
          <button className="btn btn-primary">
            Skontaktuj się
          </button>
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
