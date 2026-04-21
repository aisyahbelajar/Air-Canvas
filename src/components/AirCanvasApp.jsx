import { useEffect, useRef, useState } from "react";
import Camera from "./Camera";
import CanvasLayer from "./CanvasLayer";
import ControlPanel from "./ControlPanel";
import { useCamera } from "../hooks/useCamera";
import { useHandTracking } from "../hooks/useHandTracking";

export default function AirCanvasApp() {
    const { videoRef, status, error } = useCamera();
    const { getLatest } = useHandTracking({ videoRef, enabled: status === "active" });

    // Brush settings live in a ref so changing them never restarts the draw loop.
    const brushRef = useRef({ size: 6, color: "#22d3ee" });
    const canvasApiRef = useRef(null);

    // Sample hand-detected status at low frequency for the status pill (UI only).
    const [handDetected, setHandDetected] = useState(false);
    useEffect(() => {
        const id = setInterval(() => {
            setHandDetected(getLatest().isHandDetected);
        }, 250);
        return () => clearInterval(id);
    }, [getLatest]);

    return (
        <div className="relative h-screen w-screen overflow-hidden bg-background text-foreground">
            {/* Drawing surface */}
            <CanvasLayer
                ref={canvasApiRef}
                getLatestTracking={getLatest}
                brushRef={brushRef}
            />

            {/* Webcam preview — small floating tile, mirrored */}
            <div className="pointer-events-none fixed bottom-4 left-4 z-10 h-32 w-44 overflow-hidden rounded-xl border border-white/10 bg-black/40 shadow-2xl backdrop-blur">
                <Camera ref={videoRef} className="h-full w-full object-cover opacity-70" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1 text-[10px] uppercase tracking-widest text-white/80">
                    camera preview
                </div>
            </div>

            {/* Error overlay */}
            {status === "error" && (
                <div className="fixed inset-0 z-30 flex items-center justify-center bg-background/80 backdrop-blur">
                    <div className="max-w-sm rounded-2xl border border-destructive/30 bg-card p-6 text-center shadow-2xl">
                        <h2 className="mb-2 text-lg font-semibold">Camera unavailable</h2>
                        <p className="text-sm text-muted-foreground">{error ?? "Please grant camera permission and reload."}</p>
                    </div>
                </div>
            )}

            <ControlPanel
                brushRef={brushRef}
                onClear={() => canvasApiRef.current?.clear()}
                cameraStatus={status}
                handDetected={handDetected}
            />
        </div>
    );
}
