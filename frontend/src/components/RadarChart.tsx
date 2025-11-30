import { useRef, useEffect, useState, useCallback } from "react";
import type { Signal } from "@/api/signals";
import { getSignalType } from "@/api/signals";
import { signalTypeLabels } from "@/feature/signals/signalSchema";
import {
  signalTypeColors,
  signalTypeColorsHover,
} from "@/feature/signals/radar/signalTypeColors";

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

interface ViewState {
  offsetX: number;
  offsetY: number;
  scale: number;
}

// Helper function for smooth interpolation
const lerp = (start: number, end: number, factor: number): number => {
  return start + (end - start) * factor;
};

// Easing function for smoother animations
const easeOutCubic = (t: number): number => {
  return 1 - Math.pow(1 - t, 3);
};

const RadarChart = ({
  userSignal,
  matches,
  onSignalClick,
  className = "",
}: RadarChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hoveredSignal, setHoveredSignal] = useState<Signal | null>(null);
  const [blipPositions, setBlipPositions] = useState<BlipPosition[]>([]);
  const animationRef = useRef<number>(0);
  const sweepAngleRef = useRef(0);

  // Animated view state - target is where we want to go, current is interpolated
  // offsetX: -128 kompensuje ml-64 (256px / 2 = 128px) żeby graf był na środku ekranu
  const [targetView, setTargetView] = useState<ViewState>({
    offsetX: -128,
    offsetY: 0,
    scale: 1,
  });
  const currentViewRef = useRef<ViewState>({
    offsetX: -128,
    offsetY: 0,
    scale: 1,
  });

  // Animated blip hover states (for smooth size transitions)
  const blipHoverStatesRef = useRef<Map<number, number>>(new Map());

  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Responsive sizing - fill available space
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        setDimensions({ width: containerWidth, height: containerHeight });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Calculate blip positions (in world coordinates, centered at 0,0)
  useEffect(() => {
    const baseRadius = 270; // Base radius in world coordinates (reduced by 10%)

    const positions: BlipPosition[] = matches.map((signal, index) => {
      // Odległość od środka jest odwrotnością match_score
      // match_score = 1.0 -> blisko środka, match_score = 0.0 -> na krawędzi
      const matchScore = signal.match_score ?? 0.5; // Default to 0.5 if no match_score
      const distanceRatio = 1 - matchScore;
      const distance = distanceRatio * baseRadius * 0.9 + baseRadius * 0.1;

      // Rozmieść równomiernie pod różnymi kątami z pewnym losowym odchyleniem
      const baseAngle = (index / matches.length) * 2 * Math.PI;
      const angleOffset = (Math.random() - 0.5) * 0.3;
      const angle = baseAngle + angleOffset;

      return {
        signal,
        x: distance * Math.cos(angle),
        y: distance * Math.sin(angle),
        angle,
      };
    });

    setBlipPositions(positions);
  }, [matches]);

  // Convert world coordinates to screen coordinates
  const worldToScreen = useCallback(
    (worldX: number, worldY: number, view: ViewState) => {
      const { width, height } = dimensions;
      const centerX = width / 2;
      const centerY = height / 2;
      return {
        x: centerX + (worldX + view.offsetX) * view.scale,
        y: centerY + (worldY + view.offsetY) * view.scale,
      };
    },
    [dimensions]
  );

  // Convert screen coordinates to world coordinates
  const screenToWorld = useCallback(
    (screenX: number, screenY: number) => {
      const view = currentViewRef.current;
      const { width, height } = dimensions;
      const centerX = width / 2;
      const centerY = height / 2;
      return {
        x: (screenX - centerX) / view.scale - view.offsetX,
        y: (screenY - centerY) / view.scale - view.offsetY,
      };
    },
    [dimensions]
  );

  // Draw radar
  const drawRadar = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Smoothly interpolate current view towards target view
    const animationSpeed = 0.12; // Adjust for faster/slower animations
    const current = currentViewRef.current;
    const target = targetView;

    current.offsetX = lerp(current.offsetX, target.offsetX, animationSpeed);
    current.offsetY = lerp(current.offsetY, target.offsetY, animationSpeed);
    current.scale = lerp(current.scale, target.scale, animationSpeed);

    const view = current;

    const { width, height } = dimensions;
    const baseRadius = 270; // Reduced by 10%

    // Clear canvas with light background
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, width, height);

    // Draw grid pattern (infinite grid effect)
    const gridSize = 50 * view.scale;
    const { x: originX, y: originY } = worldToScreen(0, 0, view);

    ctx.strokeStyle = "rgba(100, 116, 139, 0.1)";
    ctx.lineWidth = 1;

    // Vertical lines
    const startGridX = Math.floor(-originX / gridSize) * gridSize;
    for (let x = startGridX; x < width - originX; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(originX + x, 0);
      ctx.lineTo(originX + x, height);
      ctx.stroke();
    }

    // Horizontal lines
    const startGridY = Math.floor(-originY / gridSize) * gridSize;
    for (let y = startGridY; y < height - originY; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, originY + y);
      ctx.lineTo(width, originY + y);
      ctx.stroke();
    }

    // Draw radar rings (concentric circles)
    const ringCount = 5;
    for (let i = 1; i <= ringCount; i++) {
      const radius = (i / ringCount) * baseRadius * view.scale;
      const { x: cx, y: cy } = worldToScreen(0, 0, view);

      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = `rgba(59, 130, 246, ${0.2 + (ringCount - i) * 0.05})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Add percentage labels on rings
      if (i < ringCount && view.scale > 0.5) {
        const percent = Math.round((1 - i / ringCount) * 100);
        ctx.fillStyle = "rgba(59, 130, 246, 0.7)";
        ctx.font = `${Math.max(10, 12 * view.scale)}px sans-serif`;
        ctx.fillText(`${percent}%`, cx + radius + 5, cy - 5);
      }
    }

    // Draw cross lines
    const { x: cx, y: cy } = worldToScreen(0, 0, view);
    const maxDrawRadius = baseRadius * view.scale;

    ctx.strokeStyle = "rgba(59, 130, 246, 0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - maxDrawRadius, cy);
    ctx.lineTo(cx + maxDrawRadius, cy);
    ctx.moveTo(cx, cy - maxDrawRadius);
    ctx.lineTo(cx, cy + maxDrawRadius);
    // Diagonal lines
    const diagOffset = maxDrawRadius * Math.cos(Math.PI / 4);
    ctx.moveTo(cx - diagOffset, cy - diagOffset);
    ctx.lineTo(cx + diagOffset, cy + diagOffset);
    ctx.moveTo(cx + diagOffset, cy - diagOffset);
    ctx.lineTo(cx - diagOffset, cy + diagOffset);
    ctx.stroke();

    // Draw sweep line (animated)
    sweepAngleRef.current += 0.01;
    if (sweepAngleRef.current > 2 * Math.PI) {
      sweepAngleRef.current = 0;
    }

    const sweepEndX = cx + maxDrawRadius * Math.cos(sweepAngleRef.current);
    const sweepEndY = cy + maxDrawRadius * Math.sin(sweepAngleRef.current);

    const gradient = ctx.createLinearGradient(cx, cy, sweepEndX, sweepEndY);
    gradient.addColorStop(0, "rgba(59, 130, 246, 0.4)");
    gradient.addColorStop(1, "rgba(59, 130, 246, 0)");

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(
      cx,
      cy,
      maxDrawRadius,
      sweepAngleRef.current - 0.3,
      sweepAngleRef.current
    );
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw blips (matched signals) with smooth hover animation
    blipPositions.forEach(({ signal, x: worldX, y: worldY }) => {
      const { x, y } = worldToScreen(worldX, worldY, view);

      // Skip if outside visible area (with some margin)
      if (x < -50 || x > width + 50 || y < -50 || y > height + 50) return;

      const isHovered = hoveredSignal?.id === signal.id;

      // Animate hover state (0 = not hovered, 1 = fully hovered)
      const currentHoverState = blipHoverStatesRef.current.get(signal.id) || 0;
      const targetHoverState = isHovered ? 1 : 0;
      const newHoverState = lerp(currentHoverState, targetHoverState, 0.15);
      blipHoverStatesRef.current.set(signal.id, newHoverState);

      // Interpolate size based on hover state
      const baseBlipRadius = lerp(14, 20, easeOutCubic(newHoverState));
      const blipRadius = baseBlipRadius * Math.min(view.scale, 1.5);

      // Interpolate color based on hover state
      const signalType = getSignalType(signal);
      const baseColor = signalTypeColors[signalType];
      const hoverColor = signalTypeColorsHover[signalType];
      const color = newHoverState > 0.5 ? hoverColor : baseColor;

      // Glow effect (increases with hover)
      const glowIntensity = 1 + newHoverState * 0.5;
      const glow = ctx.createRadialGradient(
        x,
        y,
        0,
        x,
        y,
        blipRadius * 2 * glowIntensity
      );
      glow.addColorStop(0, color);
      glow.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.arc(x, y, blipRadius * 2 * glowIntensity, 0, 2 * Math.PI);
      ctx.fillStyle = glow;
      ctx.fill();

      // Main blip
      ctx.beginPath();
      ctx.arc(x, y, blipRadius, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();

      // Border (animates thickness)
      ctx.strokeStyle = newHoverState > 0.5 ? "#1e293b" : "rgba(30,41,59,0.3)";
      ctx.lineWidth = lerp(1, 2, newHoverState);
      ctx.stroke();

      // Match score text for hovered blip or when zoomed in
      const textOpacity = Math.max(newHoverState, view.scale > 1.2 ? 1 : 0);
      if (textOpacity > 0.01) {
        ctx.globalAlpha = textOpacity;
        ctx.fillStyle = "#1e293b";
        ctx.font = `bold ${Math.max(10, 12 * view.scale)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(
          `${Math.round((signal.match_score ?? 0) * 100)}%`,
          x,
          y - blipRadius - 8
        );
        if (newHoverState > 0.5 || view.scale > 1.5) {
          const title = signal.details?.title ?? "Sygnał";
          ctx.fillText(title.substring(0, 20), x, y + blipRadius + 16);
        }
        ctx.globalAlpha = 1;
      }
    });

    // Draw user signal in center
    const userSignalType = getSignalType(userSignal);
    const userColor = signalTypeColors[userSignalType];
    const userRadius = 22 * Math.min(view.scale, 1.5);

    // User glow
    const userGlow = ctx.createRadialGradient(
      cx,
      cy,
      0,
      cx,
      cy,
      userRadius * 2
    );
    userGlow.addColorStop(0, userColor);
    userGlow.addColorStop(0.5, `${userColor}66`);
    userGlow.addColorStop(1, "transparent");
    ctx.beginPath();
    ctx.arc(cx, cy, userRadius * 2, 0, 2 * Math.PI);
    ctx.fillStyle = userGlow;
    ctx.fill();

    // User blip
    ctx.beginPath();
    ctx.arc(cx, cy, userRadius, 0, 2 * Math.PI);
    ctx.fillStyle = userColor;
    ctx.fill();
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 3;
    ctx.stroke();

    // "TY" label
    ctx.fillStyle = "#fff";
    ctx.font = `bold ${Math.max(12, 14 * view.scale)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("TY", cx, cy);

    // Request next frame
    animationRef.current = requestAnimationFrame(drawRadar);
  }, [
    dimensions,
    blipPositions,
    hoveredSignal,
    userSignal,
    targetView,
    worldToScreen,
  ]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(drawRadar);
    return () => cancelAnimationFrame(animationRef.current);
  }, [drawRadar]);

  // Handle mouse wheel for zoom
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Get world position before zoom (use current animated view)
      const worldBefore = screenToWorld(mouseX, mouseY);

      // Calculate new scale
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.max(
        0.2,
        Math.min(5, targetView.scale * zoomFactor)
      );

      // Calculate new offset to zoom towards mouse position
      const { width, height } = dimensions;
      const centerX = width / 2;
      const centerY = height / 2;

      const newOffsetX = (mouseX - centerX) / newScale - worldBefore.x;
      const newOffsetY = (mouseY - centerY) / newScale - worldBefore.y;

      setTargetView({
        scale: newScale,
        offsetX: newOffsetX,
        offsetY: newOffsetY,
      });
    },
    [targetView.scale, screenToWorld, dimensions]
  );

  // Attach wheel event listener
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  // Handle mouse events for pan
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 0) {
      // Left click
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const view = currentViewRef.current;

    if (isPanning) {
      const dx = (e.clientX - panStart.x) / view.scale;
      const dy = (e.clientY - panStart.y) / view.scale;

      setTargetView((prev) => ({
        ...prev,
        offsetX: prev.offsetX + dx,
        offsetY: prev.offsetY + dy,
      }));

      // Also update currentViewRef immediately for smoother panning
      currentViewRef.current = {
        ...currentViewRef.current,
        offsetX: currentViewRef.current.offsetX + dx,
        offsetY: currentViewRef.current.offsetY + dy,
      };

      setPanStart({ x: e.clientX, y: e.clientY });
      canvas.style.cursor = "grabbing";
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Check if mouse is over any blip
    const hoveredBlip = blipPositions.find(({ x: worldX, y: worldY }) => {
      const { x, y } = worldToScreen(worldX, worldY, view);
      const distance = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2);
      return distance < 20 * Math.min(view.scale, 1.5);
    });

    setHoveredSignal(hoveredBlip?.signal || null);
    canvas.style.cursor = hoveredBlip ? "pointer" : "grab";
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) return;

    const canvas = canvasRef.current;
    if (!canvas || !onSignalClick) return;

    const view = currentViewRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const clickedBlip = blipPositions.find(({ x: worldX, y: worldY }) => {
      const { x, y } = worldToScreen(worldX, worldY, view);
      const distance = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2);
      return distance < 20 * Math.min(view.scale, 1.5);
    });

    if (clickedBlip) {
      onSignalClick(clickedBlip.signal);
    }
  };

  // Reset view with smooth animation
  const handleReset = () => {
    setTargetView({ offsetX: -128, offsetY: 0, scale: 1 });
  };

  return (
    <div ref={containerRef} className={`relative w-full h-full ${className}`}>
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          setHoveredSignal(null);
          setIsPanning(false);
        }}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        className="absolute inset-0 cursor-grab"
      />
      {/* Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={() =>
            setTargetView((prev) => ({
              ...prev,
              scale: Math.min(5, prev.scale * 1.2),
            }))
          }
          className="btn btn-circle btn-sm bg-base-300/80 hover:bg-base-300 backdrop-blur-sm transition-all duration-200 hover:scale-110"
          title="Przybliż"
        >
          +
        </button>
        <button
          onClick={() =>
            setTargetView((prev) => ({
              ...prev,
              scale: Math.max(0.2, prev.scale * 0.8),
            }))
          }
          className="btn btn-circle btn-sm bg-base-300/80 hover:bg-base-300 backdrop-blur-sm transition-all duration-200 hover:scale-110"
          title="Oddal"
        >
          −
        </button>
        <button
          onClick={handleReset}
          className="btn btn-circle btn-sm bg-base-300/80 hover:bg-base-300 backdrop-blur-sm transition-all duration-200 hover:scale-110"
          title="Resetuj widok"
        >
          ⟲
        </button>
      </div>
      {/* Zoom indicator */}
      <div className="absolute top-4 left-4 bg-base-300/80 px-3 py-1 rounded-lg backdrop-blur-sm text-sm transition-all duration-300">
        {Math.round(targetView.scale * 100)}%
      </div>
      {/* Legend & Instructions */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-2">
        <div className="flex gap-4 bg-base-300/90 px-4 py-2 rounded-lg backdrop-blur-sm">
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
        <div className="text-xs text-base-content/50">
          Scroll aby przybliżyć/oddalić • Przeciągnij aby przesunąć
        </div>
      </div>
    </div>
  );
};

export default RadarChart;
