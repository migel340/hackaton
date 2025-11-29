import { useRef, useEffect, useState, useCallback } from "react";
import type { Signal } from "@/api/signals";
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

const RadarChart = ({ userSignal, matches, onSignalClick, className = "" }: RadarChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hoveredSignal, setHoveredSignal] = useState<Signal | null>(null);
  const [blipPositions, setBlipPositions] = useState<BlipPosition[]>([]);
  const animationRef = useRef<number>(0);
  const sweepAngleRef = useRef(0);
  
  // View state for pan and zoom
  const [view, setView] = useState<ViewState>({ offsetX: 0, offsetY: 0, scale: 1 });
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
    const baseRadius = 300; // Base radius in world coordinates

    const positions: BlipPosition[] = matches.map((signal, index) => {
      // Odległość od środka jest odwrotnością match_score
      // match_score = 1.0 -> blisko środka, match_score = 0.0 -> na krawędzi
      const distanceRatio = 1 - signal.match_score;
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
  const worldToScreen = useCallback((worldX: number, worldY: number) => {
    const { width, height } = dimensions;
    const centerX = width / 2;
    const centerY = height / 2;
    return {
      x: centerX + (worldX + view.offsetX) * view.scale,
      y: centerY + (worldY + view.offsetY) * view.scale,
    };
  }, [dimensions, view]);

  // Convert screen coordinates to world coordinates
  const screenToWorld = useCallback((screenX: number, screenY: number) => {
    const { width, height } = dimensions;
    const centerX = width / 2;
    const centerY = height / 2;
    return {
      x: (screenX - centerX) / view.scale - view.offsetX,
      y: (screenY - centerY) / view.scale - view.offsetY,
    };
  }, [dimensions, view]);

  // Draw radar
  const drawRadar = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = dimensions;
    const baseRadius = 300;

    // Clear canvas with light background
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, width, height);

    // Draw grid pattern (infinite grid effect)
    const gridSize = 50 * view.scale;
    const { x: originX, y: originY } = worldToScreen(0, 0);
    
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
      const { x: cx, y: cy } = worldToScreen(0, 0);
      
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
    const { x: cx, y: cy } = worldToScreen(0, 0);
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
    ctx.arc(cx, cy, maxDrawRadius, sweepAngleRef.current - 0.3, sweepAngleRef.current);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw blips (matched signals)
    blipPositions.forEach(({ signal, x: worldX, y: worldY }) => {
      const { x, y } = worldToScreen(worldX, worldY);
      
      // Skip if outside visible area (with some margin)
      if (x < -50 || x > width + 50 || y < -50 || y > height + 50) return;
      
      const isHovered = hoveredSignal?.id === signal.id;
      const baseBlipRadius = isHovered ? 20 : 14;
      const blipRadius = baseBlipRadius * Math.min(view.scale, 1.5);
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
      ctx.strokeStyle = isHovered ? "#1e293b" : "rgba(30,41,59,0.3)";
      ctx.lineWidth = isHovered ? 2 : 1;
      ctx.stroke();

      // Match score text for hovered blip or when zoomed in
      if (isHovered || view.scale > 1.2) {
        ctx.fillStyle = "#1e293b";
        ctx.font = `bold ${Math.max(10, 12 * view.scale)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(`${Math.round(signal.match_score * 100)}%`, x, y - blipRadius - 8);
        if (isHovered || view.scale > 1.5) {
          ctx.fillText(signal.title.substring(0, 20), x, y + blipRadius + 16);
        }
      }
    });

    // Draw user signal in center
    const userColor = signalTypeColors[userSignal.type];
    const userRadius = 22 * Math.min(view.scale, 1.5);
    
    // User glow
    const userGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, userRadius * 2);
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
  }, [dimensions, blipPositions, hoveredSignal, userSignal, view, worldToScreen]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(drawRadar);
    return () => cancelAnimationFrame(animationRef.current);
  }, [drawRadar]);

  // Handle mouse wheel for zoom
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Get world position before zoom
    const worldBefore = screenToWorld(mouseX, mouseY);

    // Calculate new scale
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.2, Math.min(5, view.scale * zoomFactor));

    // Calculate new offset to zoom towards mouse position
    const { width, height } = dimensions;
    const centerX = width / 2;
    const centerY = height / 2;

    const newOffsetX = (mouseX - centerX) / newScale - worldBefore.x;
    const newOffsetY = (mouseY - centerY) / newScale - worldBefore.y;

    setView({
      scale: newScale,
      offsetX: newOffsetX,
      offsetY: newOffsetY,
    });
  }, [view.scale, screenToWorld, dimensions]);

  // Attach wheel event listener
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  // Handle mouse events for pan
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 0) { // Left click
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

    if (isPanning) {
      const dx = (e.clientX - panStart.x) / view.scale;
      const dy = (e.clientY - panStart.y) / view.scale;
      
      setView(prev => ({
        ...prev,
        offsetX: prev.offsetX + dx,
        offsetY: prev.offsetY + dy,
      }));
      
      setPanStart({ x: e.clientX, y: e.clientY });
      canvas.style.cursor = "grabbing";
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Check if mouse is over any blip
    const hoveredBlip = blipPositions.find(({ x: worldX, y: worldY }) => {
      const { x, y } = worldToScreen(worldX, worldY);
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

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const clickedBlip = blipPositions.find(({ x: worldX, y: worldY }) => {
      const { x, y } = worldToScreen(worldX, worldY);
      const distance = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2);
      return distance < 20 * Math.min(view.scale, 1.5);
    });

    if (clickedBlip) {
      onSignalClick(clickedBlip.signal);
    }
  };

  // Reset view
  const handleReset = () => {
    setView({ offsetX: 0, offsetY: 0, scale: 1 });
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
          onClick={() => setView(prev => ({ ...prev, scale: Math.min(5, prev.scale * 1.2) }))}
          className="btn btn-circle btn-sm bg-base-300/80 hover:bg-base-300 backdrop-blur-sm"
          title="Przybliż"
        >
          +
        </button>
        <button
          onClick={() => setView(prev => ({ ...prev, scale: Math.max(0.2, prev.scale * 0.8) }))}
          className="btn btn-circle btn-sm bg-base-300/80 hover:bg-base-300 backdrop-blur-sm"
          title="Oddal"
        >
          −
        </button>
        <button
          onClick={handleReset}
          className="btn btn-circle btn-sm bg-base-300/80 hover:bg-base-300 backdrop-blur-sm"
          title="Resetuj widok"
        >
          ⟲
        </button>
      </div>

      {/* Zoom indicator */}
      <div className="absolute top-4 left-4 bg-base-300/80 px-3 py-1 rounded-lg backdrop-blur-sm text-sm">
        {Math.round(view.scale * 100)}%
      </div>
      
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

      {/* Instructions */}
      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 text-xs text-base-content/50">
        Scroll aby przybliżyć/oddalić • Przeciągnij aby przesunąć
      </div>
    </div>
  );
};

export default RadarChart;
