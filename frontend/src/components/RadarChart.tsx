import { useRef, useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import type { Signal } from "@/api/signals";
import { getSignalType, getSignalTitle } from "@/api/signals";
import { signalTypeLabels } from "@/feature/signals/signalSchema";
import {
  signalTypeColors,
  signalTypeColorsHover,
} from "@/feature/signals/radar/signalTypeColors";

// Theme colors
const themeColors = {
  light: {
    background: "#f8fafc",
    grid: "rgba(100, 116, 139, 0.1)",
    ring: (i: number, ringCount: number) => `rgba(59, 130, 246, ${0.2 + (ringCount - i) * 0.05})`,
    ringLabel: "rgba(59, 130, 246, 0.7)",
    crossLine: "rgba(59, 130, 246, 0.15)",
    sweepStart: "rgba(59, 130, 246, 0.4)",
    sweepEnd: "rgba(59, 130, 246, 0)",
    blipBorder: "#1e293b",
    blipBorderFaded: "rgba(30,41,59,0.3)",
    text: "#1e293b",
    userLabel: "#fff",
  },
  dark: {
    background: "#0f172a",
    grid: "rgba(148, 163, 184, 0.1)",
    ring: (i: number, ringCount: number) => `rgba(96, 165, 250, ${0.25 + (ringCount - i) * 0.05})`,
    ringLabel: "rgba(96, 165, 250, 0.8)",
    crossLine: "rgba(96, 165, 250, 0.2)",
    sweepStart: "rgba(96, 165, 250, 0.5)",
    sweepEnd: "rgba(96, 165, 250, 0)",
    blipBorder: "#e2e8f0",
    blipBorderFaded: "rgba(226,232,240,0.3)",
    text: "#e2e8f0",
    userLabel: "#1e293b",
  },
};

interface RadarChartProps {
  userSignal: Signal;
  matches: Signal[];
  onSignalClick?: (signal: Signal) => void;
  focusedSignalId?: number | null;
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
  focusedSignalId,
  className = "",
}: RadarChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hoveredSignal, setHoveredSignal] = useState<Signal | null>(null);
  const [hoveredSignalPosition, setHoveredSignalPosition] = useState<{ x: number; y: number } | null>(null);
  const [isHoveringUserBlip, setIsHoveringUserBlip] = useState(false);
  const [isFocusLocked, setIsFocusLocked] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [blipPositions, setBlipPositions] = useState<BlipPosition[]>([]);
  const animationRef = useRef<number>(0);
  const sweepAngleRef = useRef(0);
console.log(userSignal)
  // Theme state
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.getAttribute("data-theme") === "dark";
  });

  // Listen for theme changes
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "data-theme") {
          setIsDark(document.documentElement.getAttribute("data-theme") === "dark");
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const colors = isDark ? themeColors.dark : themeColors.light;

  // Animated view state - target is where we want to go, current is interpolated
  const [targetView, setTargetView] = useState<ViewState>({
    offsetX: 0,
    offsetY: 0,
    scale: 1,
  });
  const currentViewRef = useRef<ViewState>({
    offsetX: 0,
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

  // Calculate base radius based on screen dimensions
  const getBaseRadius = useCallback(() => {
    const { width, height } = dimensions;
    const minDimension = Math.min(width, height);
    // Use 42% of the smaller dimension for the radar radius
    return minDimension * 0.42;
  }, [dimensions]);

  // Calculate blip positions (in world coordinates, centered at 0,0)
  useEffect(() => {
    const baseRadius = getBaseRadius();

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
  }, [matches, getBaseRadius]);

  // Focus on a specific signal when focusedSignalId changes
  useEffect(() => {
    if (focusedSignalId === null || focusedSignalId === undefined) return;
    
    const focusedPosition = blipPositions.find(
      (pos) => pos.signal.id === focusedSignalId
    );
    
    if (focusedPosition) {
      // Center the view on the focused signal and zoom in slightly
      setTargetView({
        offsetX: -focusedPosition.x,
        offsetY: -focusedPosition.y,
        scale: 1.8, // Zoom in when focusing
      });
      
      // Set the hovered signal to show tooltip and lock it
      setHoveredSignal(focusedPosition.signal);
      setIsFocusLocked(true);
      
      // Calculate screen position for tooltip (after animation, it will be centered)
      // We set position to center of screen since the signal will be centered there
      const centerX = dimensions.width / 2;
      const centerY = dimensions.height / 2;
      setHoveredSignalPosition({ x: centerX, y: centerY });
    }
  }, [focusedSignalId, blipPositions, dimensions]);

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
    const baseRadius = getBaseRadius();

    // Clear canvas with theme-aware background
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, width, height);

    // Draw grid pattern (infinite grid effect)
    const gridSize = 50 * view.scale;
    const { x: originX, y: originY } = worldToScreen(0, 0, view);

    ctx.strokeStyle = colors.grid;
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
      ctx.strokeStyle = colors.ring(i, ringCount);
      ctx.lineWidth = 1;
      ctx.stroke();

      // Add percentage labels on rings
      if (i < ringCount && view.scale > 0.5) {
        const percent = Math.round((1 - i / ringCount) * 100);
        ctx.fillStyle = colors.ringLabel;
        ctx.font = `${Math.max(10, 12 * view.scale)}px sans-serif`;
        ctx.fillText(`${percent}%`, cx + radius + 5, cy - 5);
      }
    }

    // Draw cross lines
    const { x: cx, y: cy } = worldToScreen(0, 0, view);
    const maxDrawRadius = baseRadius * view.scale;

    ctx.strokeStyle = colors.crossLine;
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
    gradient.addColorStop(0, colors.sweepStart);
    gradient.addColorStop(1, colors.sweepEnd);

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

      // // Border (animates thickness)
      // ctx.strokeStyle = newHoverState > 0.5 ? colors.blipBorder : colors.blipBorderFaded;
      // ctx.lineWidth = lerp(1, 2, newHoverState);
      ctx.stroke();
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
    ctx.stroke();


    // Request next frame
    animationRef.current = requestAnimationFrame(drawRadar);
  }, [
    dimensions,
    blipPositions,
    hoveredSignal,
    userSignal,
    targetView,
    worldToScreen,
    colors,
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
      // Unlock focus when starting to pan
      setIsFocusLocked(false);
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

    // Check if mouse is over user blip (center)
    const { x: centerX, y: centerY } = worldToScreen(0, 0, view);
    const userRadius = 22 * Math.min(view.scale, 1.5);
    const distanceToCenter = Math.sqrt((mouseX - centerX) ** 2 + (mouseY - centerY) ** 2);
    const isOverUserBlip = distanceToCenter < userRadius;
    setIsHoveringUserBlip(isOverUserBlip);

    // Check if mouse is over any blip
    const hoveredBlip = blipPositions.find(({ x: worldX, y: worldY }) => {
      const { x, y } = worldToScreen(worldX, worldY, view);
      const distance = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2);
      return distance < 20 * Math.min(view.scale, 1.5);
    });

    // If we have a locked focus, only update if hovering a different blip
    if (hoveredBlip) {
      // Hovering a blip - update to this one and unlock focus
      setHoveredSignal(hoveredBlip.signal);
      setIsFocusLocked(false);
      const { x, y } = worldToScreen(hoveredBlip.x, hoveredBlip.y, view);
      setHoveredSignalPosition({ x, y });
    } else if (!isFocusLocked) {
      // Not hovering any blip and no focus lock - clear tooltip
      setHoveredSignal(null);
      setHoveredSignalPosition(null);
    }
    // If isFocusLocked and not hovering any blip - keep the current tooltip
    
    canvas.style.cursor = (hoveredBlip || isOverUserBlip) ? "pointer" : "grab";
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const view = currentViewRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Check if clicked on user blip (center)
    const { x: centerX, y: centerY } = worldToScreen(0, 0, view);
    const userRadius = 22 * Math.min(view.scale, 1.5);
    const distanceToCenter = Math.sqrt((mouseX - centerX) ** 2 + (mouseY - centerY) ** 2);
    if (distanceToCenter < userRadius) {
      setIsUserModalOpen(true);
      return;
    }

    // Check if clicked on any other blip
    if (!onSignalClick) return;

    const clickedBlip = blipPositions.find(({ x: worldX, y: worldY }) => {
      const { x, y } = worldToScreen(worldX, worldY, view);
      const distance = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2);
      return distance < 20 * Math.min(view.scale, 1.5);
    });

    if (clickedBlip) {
      onSignalClick(clickedBlip.signal);
    } else {
      // Clicked on empty space - unlock focus and clear tooltip
      setIsFocusLocked(false);
      setHoveredSignal(null);
      setHoveredSignalPosition(null);
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
          setIsHoveringUserBlip(false);
          setIsPanning(false);
        }}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        className="absolute inset-0 cursor-grab"
      />

      {/* User Signal Tooltip */}
      {isHoveringUserBlip && userSignal && (
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-full -mt-16 z-30 pointer-events-none">
          <div className="bg-base-100 border border-base-300 rounded-xl shadow-xl p-4 min-w-96 max-w-lg animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: signalTypeColors[getSignalType(userSignal)] }}
              />
              <span className="font-bold text-base-content">
                {signalTypeLabels[getSignalType(userSignal)]}
              </span>
            </div>
            <h3 className="font-semibold text-lg text-base-content mb-1 break-words">
              {userSignal.details?.name || userSignal.details?.title || getSignalTitle(userSignal.details)}
            </h3>
            {userSignal.details?.description && (
              <p className="text-sm text-base-content/70 line-clamp-3 break-words">
                {userSignal.details.description}
              </p>
            )}
            {/* Idea: stage + looking_for */}
            {userSignal.details?.stage && typeof userSignal.details.stage === 'string' && (
              <div className="mt-2">
                <span className="badge badge-sm badge-info">{userSignal.details.stage}</span>
              </div>
            )}
            {userSignal.details?.looking_for && Array.isArray(userSignal.details.looking_for) && userSignal.details.looking_for.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {userSignal.details.looking_for.slice(0, 3).map((item, i) => (
                  <span key={i} className="badge badge-sm badge-secondary">
                    {item}
                  </span>
                ))}
              </div>
            )}
            {userSignal.details?.funding_needed && (
              <p className="text-sm font-semibold text-primary mt-2">{userSignal.details.funding_needed}</p>
            )}
            {/* Freelancer: skills */}
            {userSignal.details?.skills && userSignal.details.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {userSignal.details.skills.slice(0, 5).map((skill) => (
                  <span key={skill} className="badge badge-sm badge-primary">
                    {skill}
                  </span>
                ))}
              </div>
            )}
            {/* Categories */}
            {userSignal.details?.categories && userSignal.details.categories.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {userSignal.details.categories.slice(0, 3).map((cat) => (
                  <span key={cat} className="badge badge-sm badge-accent">
                    {cat}
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs text-base-content/50 mt-3">Kliknij, aby zobaczyć szczegóły</p>
          </div>
        </div>
      )}

      {/* Matched Signal Tooltip */}
      {hoveredSignal && hoveredSignalPosition && !isHoveringUserBlip && (
        <div 
          className="absolute z-30 pointer-events-none"
          style={{
            left: hoveredSignalPosition.x,
            top: hoveredSignalPosition.y,
            transform: 'translate(-50%, -100%)',
            marginTop: '-20px',
          }}
        >
          <div className="bg-base-100 border border-base-300 rounded-xl shadow-xl p-4 min-w-72 max-w-sm animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: signalTypeColors[getSignalType(hoveredSignal)] }}
              />
              <span className="font-bold text-base-content">
                {signalTypeLabels[getSignalType(hoveredSignal)]}
              </span>
              {hoveredSignal.match_score !== undefined && (
                <span className="badge badge-success badge-sm ml-auto">
                  {Math.round(hoveredSignal.match_score * 100)}%
                </span>
              )}
            </div>
            <h3 className="font-semibold text-base text-base-content mb-1 break-words">
              {hoveredSignal.details?.title || hoveredSignal.details?.name || getSignalTitle(hoveredSignal.details)}
            </h3>
            {hoveredSignal.username && (
              <p className="text-xs text-base-content/60 mb-2">
                @{hoveredSignal.username}
              </p>
            )}
            {hoveredSignal.details?.description && (
              <p className="text-sm text-base-content/70 line-clamp-2 break-words">
                {hoveredSignal.details.description}
              </p>
            )}
            {/* Skills for freelancer */}
            {hoveredSignal.details?.skills && hoveredSignal.details.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {hoveredSignal.details.skills.slice(0, 4).map((skill) => (
                  <span key={skill} className="badge badge-xs badge-primary">
                    {skill}
                  </span>
                ))}
                {hoveredSignal.details.skills.length > 4 && (
                  <span className="badge badge-xs badge-ghost">+{hoveredSignal.details.skills.length - 4}</span>
                )}
              </div>
            )}
            {/* Categories */}
            {hoveredSignal.details?.categories && hoveredSignal.details.categories.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {hoveredSignal.details.categories.slice(0, 3).map((cat) => (
                  <span key={cat} className="badge badge-xs badge-accent">
                    {cat}
                  </span>
                ))}
              </div>
            )}
            {/* Investor: focus areas */}
            {hoveredSignal.details?.focus_areas && hoveredSignal.details.focus_areas.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {hoveredSignal.details.focus_areas.slice(0, 3).map((area) => (
                  <span key={area} className="badge badge-xs badge-info">
                    {area}
                  </span>
                ))}
              </div>
            )}
            {/* Investor: ticket size */}
            {hoveredSignal.details?.ticket_size && (
              <p className="text-xs font-medium text-primary mt-2">
                💰 {hoveredSignal.details.ticket_size}
              </p>
            )}
            {/* Idea: funding needed */}
            {hoveredSignal.details?.funding_needed && (
              <p className="text-xs font-medium text-primary mt-2">
                💰 {hoveredSignal.details.funding_needed}
              </p>
            )}
            <p className="text-xs text-base-content/40 mt-3 border-t border-base-300 pt-2">Kliknij, aby zobaczyć szczegóły</p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-24 inset-x-0 flex justify-center">
        <div className="flex gap-3">
          <button
            onClick={() =>
              setTargetView((prev) => ({
                ...prev,
                scale: Math.min(5, prev.scale * 1.2),
              }))
            }
            className="btn btn-circle btn-lg bg-base-300/80 hover:bg-base-300 backdrop-blur-sm transition-all duration-200 hover:scale-110 text-xl"
            title="Przybliż"
          >
            +
          </button>
          <button
            onClick={handleReset}
            className="btn btn-circle btn-lg bg-base-300/80 hover:bg-base-300 backdrop-blur-sm transition-all duration-200 hover:scale-110 text-xl"
            title="Resetuj widok"
          >
            ⟲
          </button>
          <button
            onClick={() =>
              setTargetView((prev) => ({
                ...prev,
                scale: Math.max(0.2, prev.scale * 0.8),
              }))
            }
            className="btn btn-circle btn-lg bg-base-300/80 hover:bg-base-300 backdrop-blur-sm transition-all duration-200 hover:scale-110 text-xl"
            title="Oddal"
          >
            −
          </button>
        </div>
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

      {/* User Signal Modal - rendered via Portal to be above everything */}
      {isUserModalOpen && userSignal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-base-100 rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-base-100 border-b border-base-300 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: signalTypeColors[getSignalType(userSignal)] }}
                />
                <span className="font-bold text-lg">
                  {signalTypeLabels[getSignalType(userSignal)]}
                </span>
              </div>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="btn btn-sm btn-circle btn-ghost"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Tytuł - name lub title */}
              {(userSignal.details?.name || userSignal.details?.title) && (
                <h2 className="text-2xl font-bold text-base-content">
                  {userSignal.details.name || userSignal.details.title}
                </h2>
              )}

              {/* Opis */}
              {userSignal.details?.description && (
                <div>
                  <h3 className="font-semibold text-base-content/70 mb-1">Opis</h3>
                  <p className="text-base-content whitespace-pre-wrap break-words">
                    {userSignal.details.description}
                  </p>
                </div>
              )}

              {/* === IDEA FIELDS (signal_category_id: 2) === */}
              {userSignal.details?.stage && typeof userSignal.details.stage === 'string' && (
                <div>
                  <h3 className="font-semibold text-base-content/70 mb-1">Etap projektu</h3>
                  <span className="badge badge-info badge-lg">{userSignal.details.stage}</span>
                </div>
              )}

              {userSignal.details?.looking_for && Array.isArray(userSignal.details.looking_for) && userSignal.details.looking_for.length > 0 && (
                <div>
                  <h3 className="font-semibold text-base-content/70 mb-2">Kogo szukamy</h3>
                  <div className="flex flex-wrap gap-2">
                    {userSignal.details.looking_for.map((item, i) => (
                      <span key={i} className="badge badge-secondary badge-lg">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {userSignal.details?.funding_needed && (
                <div>
                  <h3 className="font-semibold text-base-content/70 mb-1">Potrzebne finansowanie</h3>
                  <p className="text-xl font-bold text-primary">{userSignal.details.funding_needed}</p>
                </div>
              )}

              {userSignal.details?.market_size && (
                <div>
                  <h3 className="font-semibold text-base-content/70 mb-1">Wielkość rynku</h3>
                  <p className="text-base-content">{userSignal.details.market_size}</p>
                </div>
              )}

              {userSignal.details?.traction && (
                <div>
                  <h3 className="font-semibold text-base-content/70 mb-1">Traction</h3>
                  <p className="text-base-content whitespace-pre-wrap">{userSignal.details.traction}</p>
                </div>
              )}

              {userSignal.details?.problem && (
                <div>
                  <h3 className="font-semibold text-base-content/70 mb-1">Problem</h3>
                  <p className="text-base-content whitespace-pre-wrap">{userSignal.details.problem}</p>
                </div>
              )}

              {userSignal.details?.solution && (
                <div>
                  <h3 className="font-semibold text-base-content/70 mb-1">Rozwiązanie</h3>
                  <p className="text-base-content whitespace-pre-wrap">{userSignal.details.solution}</p>
                </div>
              )}

              {userSignal.details?.market && (
                <div>
                  <h3 className="font-semibold text-base-content/70 mb-1">Rynek docelowy</h3>
                  <p className="text-base-content whitespace-pre-wrap">{userSignal.details.market}</p>
                </div>
              )}

              {userSignal.details?.needed_skills && userSignal.details.needed_skills.length > 0 && (
                <div>
                  <h3 className="font-semibold text-base-content/70 mb-2">Poszukiwane umiejętności</h3>
                  <div className="flex flex-wrap gap-2">
                    {userSignal.details.needed_skills.map((skill) => (
                      <span key={skill} className="badge badge-secondary badge-lg">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {(userSignal.details?.funding_min || userSignal.details?.funding_max) && (
                <div>
                  <h3 className="font-semibold text-base-content/70 mb-1">Zakres finansowania</h3>
                  <p className="text-xl font-bold text-primary">
                    {userSignal.details.funding_min?.toLocaleString()} - {userSignal.details.funding_max?.toLocaleString()} PLN
                  </p>
                </div>
              )}

              {/* === FREELANCER FIELDS (signal_category_id: 1) === */}
              {userSignal.details?.skills && userSignal.details.skills.length > 0 && (
                <div>
                  <h3 className="font-semibold text-base-content/70 mb-2">Umiejętności</h3>
                  <div className="flex flex-wrap gap-2">
                    {userSignal.details.skills.map((skill) => (
                      <span key={skill} className="badge badge-primary badge-lg">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {userSignal.details?.hourly_rate && (
                <div>
                  <h3 className="font-semibold text-base-content/70 mb-1">Stawka godzinowa</h3>
                  <p className="text-xl font-bold text-primary">
                    {userSignal.details.hourly_rate} PLN/h
                  </p>
                </div>
              )}

              {userSignal.details?.experience && (
                <div>
                  <h3 className="font-semibold text-base-content/70 mb-1">Doświadczenie</h3>
                  <p className="text-base-content">{userSignal.details.experience}</p>
                </div>
              )}

              {userSignal.details?.availability && (
                <div>
                  <h3 className="font-semibold text-base-content/70 mb-1">Dostępność</h3>
                  <p className="text-base-content">{userSignal.details.availability}</p>
                </div>
              )}

              {/* === INVESTOR FIELDS (signal_category_id: 3) === */}
              {userSignal.details?.type && (
                <div>
                  <h3 className="font-semibold text-base-content/70 mb-1">Typ inwestora</h3>
                  <p className="text-base-content font-medium">{userSignal.details.type}</p>
                </div>
              )}

              {userSignal.details?.ticket_size && (
                <div>
                  <h3 className="font-semibold text-base-content/70 mb-1">Wielkość inwestycji</h3>
                  <p className="text-xl font-bold text-primary">{userSignal.details.ticket_size}</p>
                </div>
              )}

              {userSignal.details?.investment_stage && userSignal.details.investment_stage.length > 0 && (
                <div>
                  <h3 className="font-semibold text-base-content/70 mb-2">Preferowane etapy</h3>
                  <div className="flex flex-wrap gap-2">
                    {userSignal.details.investment_stage.map((s) => (
                      <span key={s} className="badge badge-info badge-lg">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {userSignal.details?.focus_areas && userSignal.details.focus_areas.length > 0 && (
                <div>
                  <h3 className="font-semibold text-base-content/70 mb-2">Obszary zainteresowań</h3>
                  <div className="flex flex-wrap gap-2">
                    {userSignal.details.focus_areas.map((area) => (
                      <span key={area} className="badge badge-warning badge-lg">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {userSignal.details?.criteria && userSignal.details.criteria.length > 0 && (
                <div>
                  <h3 className="font-semibold text-base-content/70 mb-2">Kryteria inwestycyjne</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {userSignal.details.criteria.map((c, i) => (
                      <li key={i} className="text-base-content">{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {userSignal.details?.value_add && userSignal.details.value_add.length > 0 && (
                <div>
                  <h3 className="font-semibold text-base-content/70 mb-2">Co oferuję</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {userSignal.details.value_add.map((v, i) => (
                      <li key={i} className="text-base-content">{v}</li>
                    ))}
                  </ul>
                </div>
              )}

              {(userSignal.details?.budget_min || userSignal.details?.budget_max) && (
                <div>
                  <h3 className="font-semibold text-base-content/70 mb-1">Budżet inwestycji</h3>
                  <p className="text-xl font-bold text-primary">
                    {userSignal.details.budget_min?.toLocaleString()} - {userSignal.details.budget_max?.toLocaleString()} PLN
                  </p>
                </div>
              )}

              {/* === COMMON FIELDS === */}
              {userSignal.details?.categories && userSignal.details.categories.length > 0 && (
                <div>
                  <h3 className="font-semibold text-base-content/70 mb-2">Kategorie</h3>
                  <div className="flex flex-wrap gap-2">
                    {userSignal.details.categories.map((cat) => (
                      <span key={cat} className="badge badge-accent badge-lg">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Signal metadata */}
              <div className="divider"></div>
              <div className="grid grid-cols-2 gap-4 text-sm text-base-content/60">
                <div>
                  <span className="font-medium">ID sygnału:</span> {userSignal.id}
                </div>
                <div>
                  <span className="font-medium">Utworzono:</span>{" "}
                  {new Date(userSignal.created_at).toLocaleDateString("pl-PL")}
                </div>
                <div>
                  <span className="font-medium">Status:</span>{" "}
                  <span className={userSignal.is_active ? "text-success" : "text-error"}>
                    {userSignal.is_active ? "Aktywny" : "Nieaktywny"}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-base-300 px-6 py-4">
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="btn btn-primary w-full"
              >
                Zamknij
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default RadarChart;
