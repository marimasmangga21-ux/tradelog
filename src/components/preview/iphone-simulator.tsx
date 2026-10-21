"use client";

import * as React from "react";
import {
  Check,
  ChevronDown,
  Expand,
  ExternalLink,
  GripHorizontal,
  Maximize2,
  Minimize2,
  Move,
  RefreshCw,
  RotateCw,
  Scaling,
  Smartphone,
  Sparkles,
  Wifi,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DeviceColor = "natural" | "black" | "desert" | "white";
type ViewMode = "fit" | "full-height" | "original";

const COLOR_CONFIGS: Record<DeviceColor, { label: string; outerRing: string; body: string; edge: string; buttonColor: string }> = {
  natural: {
    label: "Natural Titanium",
    outerRing: "border-[#686561] bg-[#222120] shadow-[0_25px_80px_rgba(0,0,0,0.9)]",
    body: "bg-[#181716]",
    edge: "border-[#4a4743]",
    buttonColor: "bg-[#54514c]",
  },
  black: {
    label: "Black Titanium",
    outerRing: "border-[#2b2b2e] bg-[#121213] shadow-[0_25px_80px_rgba(0,0,0,0.95)]",
    body: "bg-[#0b0b0c]",
    edge: "border-[#1e1e20]",
    buttonColor: "bg-[#252528]",
  },
  desert: {
    label: "Desert Titanium",
    outerRing: "border-[#877263] bg-[#29221d] shadow-[0_25px_80px_rgba(0,0,0,0.9)]",
    body: "bg-[#1c1713]",
    edge: "border-[#5c4c41]",
    buttonColor: "bg-[#6e5d50]",
  },
  white: {
    label: "White Titanium",
    outerRing: "border-[#969699] bg-[#3a3a3d] shadow-[0_25px_80px_rgba(0,0,0,0.9)]",
    body: "bg-[#202022]",
    edge: "border-[#727275]",
    buttonColor: "bg-[#7d7d82]",
  },
};

const PRESET_PAGES = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Trades", path: "/trades" },
  { label: "Log Trade", path: "/trades/new" },
  { label: "Accounts", path: "/accounts" },
  { label: "Calendar", path: "/calendar" },
  { label: "Strategies", path: "/strategies" },
  { label: "Journals", path: "/journal" },
  { label: "Settings", path: "/settings" },
  { label: "Login", path: "/login" },
];

export function IPhoneSimulator() {
  const [currentPath, setCurrentPath] = React.useState("/dashboard");
  const [deviceColor, setDeviceColor] = React.useState<DeviceColor>("natural");
  const [viewMode, setViewMode] = React.useState<ViewMode>("full-height");
  const [isLandscape, setIsLandscape] = React.useState(false);
  const [scale, setScale] = React.useState(1.0);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
  const [dynamicIslandExpanded, setDynamicIslandExpanded] = React.useState(false);
  const [iframeKey, setIframeKey] = React.useState(1);
  const [currentTime, setCurrentTime] = React.useState("09:41");

  const canvasRef = React.useRef<HTMLDivElement>(null);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  // Auto calculate scale for "fit" mode
  const updateFitScale = React.useCallback(() => {
    if (!canvasRef.current) return;
    const canvasH = canvasRef.current.clientHeight || 650;
    const targetHeight = isLandscape ? 454 : 956;
    // Buffer 24px agar tidak menyentuh tepi
    const calculated = Math.min(1.0, Math.max(0.4, (canvasH - 28) / targetHeight));
    if (viewMode === "fit") {
      setScale(Number(calculated.toFixed(2)));
    }
  }, [isLandscape, viewMode]);

  React.useEffect(() => {
    updateFitScale();
    window.addEventListener("resize", updateFitScale);
    return () => window.removeEventListener("resize", updateFitScale);
  }, [updateFitScale]);

  React.useEffect(() => {
    if (viewMode === "fit") {
      updateFitScale();
    } else if (viewMode === "full-height") {
      setScale(1.0);
      setPosition({ x: 0, y: 0 });
    } else if (viewMode === "original") {
      setScale(1.0);
    }
  }, [viewMode, updateFitScale]);

  React.useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      setCurrentTime(`${h}:${m}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest(".prevent-drag")) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
  };

  const handleReload = () => {
    setIframeKey((k) => k + 1);
  };

  const colorConfig = COLOR_CONFIGS[deviceColor];

  // Base dimensions iPhone 17 Pro Max (430 x 932)
  const isFullHeight = viewMode === "full-height";
  const screenWidth = isLandscape ? (isFullHeight ? 820 : 932) : 430;

  return (
    <div className="relative flex flex-col h-full w-full overflow-hidden bg-[#070708] select-none">
      {/* Top Studio Control Bar */}
      <div className="z-20 flex flex-wrap items-center justify-between gap-2.5 border-b border-[#1a1a1a] bg-[#0c0c0e]/95 px-4 py-2 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#f2f2f0]">
            <Smartphone className="h-4 w-4 text-[#b2ff05]" />
            <span>iPhone 17 Pro Max</span>
            <span className="rounded bg-[#1a1a1a] px-1.5 py-0.5 text-[10px] text-[#a0a0a0]">
              Studio
            </span>
          </div>

          {/* Mode View Switcher (Solusi Layar Laptop Penuh) */}
          <div className="flex items-center rounded-lg border border-[#1f1f22] bg-[#121214] p-0.5 text-xs">
            <button
              type="button"
              onClick={() => {
                setViewMode("full-height");
                setIsLandscape(false);
              }}
              className={cn(
                "flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                viewMode === "full-height"
                  ? "bg-[#b2ff05] text-black font-semibold shadow-sm"
                  : "text-[#a0a0a0] hover:text-[#f2f2f0]"
              )}
              title="Tinggi HP mengikuti 100% tinggi layar laptop agar tidak terpotong dan nyaman diedit"
            >
              <Expand className="h-3.5 w-3.5" />
              <span>Layar Laptop Penuh (Edit Mode)</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("fit")}
              className={cn(
                "flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                viewMode === "fit"
                  ? "bg-[#b2ff05] text-black font-semibold shadow-sm"
                  : "text-[#a0a0a0] hover:text-[#f2f2f0]"
              )}
              title="Skala proporsional 19.5:9 pas di layar laptop tanpa terpotong"
            >
              <Scaling className="h-3.5 w-3.5" />
              <span>Fit Proporsional</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setViewMode("original");
                setScale(1.0);
              }}
              className={cn(
                "hidden sm:flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                viewMode === "original"
                  ? "bg-[#b2ff05] text-black font-semibold shadow-sm"
                  : "text-[#a0a0a0] hover:text-[#f2f2f0]"
              )}
              title="Ukuran asli 100% 430x932 (Bisa digeser/drag)"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              <span>100% Asli</span>
            </button>
          </div>
        </div>

        {/* Quick Route Nav Pills */}
        <div className="hidden lg:flex items-center gap-1 overflow-x-auto py-0.5">
          {PRESET_PAGES.map((page) => (
            <button
              key={page.path}
              type="button"
              onClick={() => handleNavigate(page.path)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-all",
                currentPath === page.path
                  ? "bg-[#25252a] text-[#b2ff05] font-semibold border border-[#b2ff05]/30"
                  : "bg-[#121214] text-[#888] hover:bg-[#18181b] hover:text-[#eee]"
              )}
            >
              {page.label}
            </button>
          ))}
        </div>

        {/* Canvas Adjustments: Color, Rotate, Reload, Reset */}
        <div className="flex items-center gap-2">
          {/* Color Switcher */}
          <div className="hidden sm:flex items-center gap-0.5 rounded-md border border-[#1a1a1a] bg-[#090909] p-0.5">
            {(Object.keys(COLOR_CONFIGS) as DeviceColor[]).map((col) => (
              <button
                key={col}
                type="button"
                onClick={() => setDeviceColor(col)}
                title={COLOR_CONFIGS[col].label}
                className={cn(
                  "rounded px-2 py-0.5 text-[11px] font-medium transition-colors",
                  deviceColor === col
                    ? "bg-[#18181b] text-[#b2ff05]"
                    : "text-[#777] hover:text-[#eee]"
                )}
              >
                {col.toUpperCase()}
              </button>
            ))}
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsLandscape(!isLandscape)}
            className="h-7 gap-1 border-[#1f1f22] bg-[#121214] px-2 text-xs text-[#a0a0a0] hover:text-[#b2ff05]"
          >
            <RotateCw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{isLandscape ? "Portrait" : "Landscape"}</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleReload}
            title="Reload web frame"
            className="h-7 w-7 p-0 border-[#1f1f22] bg-[#121214] text-[#a0a0a0] hover:text-[#b2ff05]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>

          {position.x !== 0 || position.y !== 0 ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPosition({ x: 0, y: 0 })}
              className="h-7 border-[#1f1f22] bg-[#121214] px-2 text-xs text-[#a0a0a0] hover:text-white"
            >
              Center
            </Button>
          ) : null}
        </div>
      </div>

      {/* Floating Drag Guide */}
      <div className="pointer-events-none absolute bottom-3 left-1/2 z-20 -translate-x-1/2 rounded-full border border-[#2a2a2e]/70 bg-black/80 px-3.5 py-1 text-[11px] text-[#a0a0a0] shadow-xl backdrop-blur-md flex items-center gap-2">
        <Move className="h-3.5 w-3.5 text-[#b2ff05]" />
        <span>
          {isFullHeight
            ? "Mode Layar Penuh Aktif: Tinggi pas dengan laptop, konten leluasa diedit & discroll langsung di dalam HP"
            : "Tahan & geser bingkai titanium untuk memindahkan posisi ponsel di layar"}
        </span>
      </div>

      {/* Canvas Workspace */}
      <div
        ref={canvasRef}
        className={cn(
          "relative flex-1 overflow-hidden flex items-center justify-center p-2 sm:p-3",
          isFullHeight ? "cursor-default" : "cursor-grab active:cursor-grabbing"
        )}
        onPointerDown={isFullHeight ? undefined : handlePointerDown}
        onPointerMove={isFullHeight ? undefined : handlePointerMove}
        onPointerUp={isFullHeight ? undefined : handlePointerUp}
      >
        {/* Subtle Workspace Grid */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#131316_1px,transparent_1px),linear-gradient(to_bottom,#131316_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />

        {/* Movable Device Container */}
        <div
          style={{
            transform: isFullHeight ? "none" : `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? "none" : "transform 0.15s ease-out",
            height: isFullHeight ? "calc(100% - 8px)" : undefined,
          }}
          className={cn(
            "relative will-change-transform flex items-center justify-center",
            isFullHeight && "h-full"
          )}
        >
          {/* Left Exterior Titanium Hardware Buttons */}
          {!isFullHeight && (
            <div className="absolute -left-[5px] top-[140px] flex flex-col gap-5">
              <div className={cn("w-[5px] h-[30px] rounded-l-sm shadow-sm", colorConfig.buttonColor)} />
              <div className={cn("w-[5px] h-[52px] rounded-l-sm shadow-sm", colorConfig.buttonColor)} />
              <div className={cn("w-[5px] h-[52px] rounded-l-sm shadow-sm", colorConfig.buttonColor)} />
            </div>
          )}

          {/* Right Exterior Titanium Buttons */}
          {!isFullHeight && (
            <div className="absolute -right-[5px] top-[180px] flex flex-col gap-12">
              <div className={cn("w-[5px] h-[75px] rounded-r-sm shadow-sm", colorConfig.buttonColor)} />
              <div className={cn("w-[4px] h-[48px] rounded-r-sm shadow-sm opacity-90", colorConfig.buttonColor)} />
            </div>
          )}

          {/* iPhone 17 Pro Max Chassis Frame */}
          <div
            className={cn(
              "relative p-[8px] sm:p-[10px] border-[3px] transition-all duration-300 flex flex-col",
              isFullHeight ? "rounded-[38px] max-h-full" : "rounded-[56px]",
              colorConfig.outerRing
            )}
            style={{
              width: screenWidth + 20,
              height: isFullHeight ? "100%" : isLandscape ? 454 : 956,
              maxWidth: "100%",
            }}
          >
            {/* Top Draggable Handle Area on Chassis */}
            {!isFullHeight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 rounded-full bg-[#18181b] border border-[#2a2a2e] px-2 py-0.5 text-[9px] text-[#a0a0a0] shadow">
                <GripHorizontal className="h-3 w-3 text-[#b2ff05]" />
                <span>Drag Phone</span>
              </div>
            )}

            {/* Inner Titanium Edge & Screen */}
            <div
              className={cn(
                "relative flex-1 w-full overflow-hidden border-[1.5px] bg-black shadow-inner flex flex-col",
                isFullHeight ? "rounded-[30px]" : "rounded-[46px]",
                colorConfig.edge
              )}
            >
              {/* Speaker slit */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 z-40 h-[4px] w-[50px] rounded-full bg-[#181818] shadow-inner" />

              {/* iOS Status Bar */}
              <div className="prevent-drag pointer-events-auto shrink-0 relative z-30 flex items-center justify-between px-7 pt-2.5 pb-2 text-[12px] font-semibold text-white tracking-tight bg-black">
                <span className="font-mono">{currentTime}</span>

                <div className="flex items-center gap-1.5 text-white/90">
                  <span className="text-[10px] font-bold tracking-tighter">5G</span>
                  <Wifi className="h-3 w-3 stroke-[2.5]" />
                  <div className="flex items-center gap-0.5">
                    <div className="h-3 w-5 rounded-[3px] border border-white/80 p-[1.5px] flex items-center">
                      <div className="h-full w-full rounded-[1px] bg-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Island */}
              <div
                onClick={() => setDynamicIslandExpanded(!dynamicIslandExpanded)}
                className={cn(
                  "prevent-drag absolute top-2 left-1/2 -translate-x-1/2 z-40 rounded-full bg-black transition-all duration-300 ease-spring flex items-center justify-between px-3 cursor-pointer shadow-lg border border-[#2a2a2a]/40",
                  dynamicIslandExpanded
                    ? "w-[240px] h-[44px] rounded-[22px] bg-[#0c0c0e] px-4"
                    : "w-[120px] h-[32px]"
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#111] ring-1 ring-white/10 flex items-center justify-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#051126]/80" />
                  </div>
                  {dynamicIslandExpanded && (
                    <div className="text-[11px] font-medium text-white flex items-center gap-1">
                      <Zap className="h-3 w-3 text-[#b2ff05]" />
                      <span>Tradelog Active</span>
                    </div>
                  )}
                </div>

                {dynamicIslandExpanded ? (
                  <span className="text-[10px] font-mono text-[#b2ff05] font-semibold">MT5 2 Accounts</span>
                ) : (
                  <div className="h-2 w-2 rounded-full bg-[#081a08] ring-1 ring-[#b2ff05]/40 flex items-center justify-center">
                    <div className="h-1 w-1 rounded-full bg-[#b2ff05] animate-pulse" />
                  </div>
                )}
              </div>

              {/* Live Web Content Frame - Scrollable & Full Interactive */}
              <div className="prevent-drag relative flex-1 w-full bg-black overflow-hidden">
                <iframe
                  ref={iframeRef}
                  key={`${currentPath}-${iframeKey}`}
                  src={currentPath}
                  title="iPhone 17 Pro Max Preview"
                  className="h-full w-full border-none bg-black"
                  style={{
                    width: "100%",
                    height: "100%",
                  }}
                />
              </div>

              {/* iOS Bottom Home Indicator Bar */}
              <div className="prevent-drag pointer-events-none shrink-0 relative z-40 h-[18px] w-full bg-black flex items-center justify-center">
                <div className="h-[4px] w-[135px] rounded-full bg-white/70 shadow-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
