import { useState } from "react";

const PRESET_COLORS = ["#ffffff", "#22d3ee", "#a78bfa", "#f472b6", "#facc15", "#34d399", "#f87171"];

export default function ControlPanel({ brushRef, onClear, cameraStatus, handDetected }) {
    // Local UI state only; brush updates are written into the ref to avoid re-rendering CanvasLayer.
    const [size, setSize] = useState(brushRef.current.size);
    const [color, setColor] = useState(brushRef.current.color);

    const updateSize = (v) => {
        setSize(v);
        brushRef.current.size = v;
    };
    const updateColor = (c) => {
        setColor(c);
        brushRef.current.color = c;
    };

    return (
        <div className="pointer-events-auto fixed right-4 top-4 z-20 w-72 rounded-2xl border border-white/10 bg-card/80 p-4 text-card-foreground shadow-2xl backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between">
                <h1 className="text-sm font-semibold tracking-wide">AirCanvas</h1>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">gesture draw</span>
            </div>

            <div className="mb-3 space-y-1.5 text-xs">
                <StatusRow label="Camera" value={cameraStatus} good={cameraStatus === "active"} />
                <StatusRow label="Hand" value={handDetected ? "detected" : "searching"} good={handDetected} />
            </div>

            <div className="mb-3">
                <label className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Brush size</span>
                    <span className="tabular-nums">{size}px</span>
                </label>
                <input
                    type="range"
                    min={1}
                    max={48}
                    value={size}
                    onChange={(e) => updateSize(Number(e.target.value))}
                    className="w-full accent-primary"
                />
            </div>

            <div className="mb-3">
                <div className="mb-1 text-xs text-muted-foreground">Color</div>
                <div className="flex flex-wrap gap-1.5">
                    {PRESET_COLORS.map((c) => (
                        <button
                            key={c}
                            onClick={() => updateColor(c)}
                            className="h-6 w-6 rounded-full ring-2 ring-offset-2 ring-offset-card transition"
                            style={{
                                backgroundColor: c,
                                boxShadow: c === color ? "0 0 0 2px var(--ring)" : "none",
                                ringColor: c === color ? "var(--ring)" : "transparent",
                            }}
                            aria-label={`color ${c}`}
                        />
                    ))}
                    <input
                        type="color"
                        value={color}
                        onChange={(e) => updateColor(e.target.value)}
                        className="h-6 w-6 cursor-pointer rounded-full border-0 bg-transparent p-0"
                    />
                </div>
            </div>

            <button
                onClick={onClear}
                className="w-full rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
                Clear canvas
            </button>

            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
                Index finger up + middle folded to draw. (Mock tracker: move mouse over preview, hold click to draw.)
            </p>
        </div>
    );
}

function StatusRow({ label, value, good }) {
    return (
        <div className="flex items-center justify-between rounded-md bg-muted/40 px-2 py-1">
            <span className="text-muted-foreground">{label}</span>
            <span className="flex items-center gap-1.5">
                <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: good ? "#34d399" : "#f59e0b" }}
                />
                <span>{value}</span>
            </span>
        </div>
    );
}
