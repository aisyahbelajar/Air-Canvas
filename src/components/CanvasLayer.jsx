import { useEffect, useImperativeHandle, useRef, forwardRef } from "react";
import { mapNormalizedToCanvas } from "../utils/coordinateMapper";
import { createMovingAverage } from "../utils/smoothing";
import { readGesture } from "../hooks/useGesture";

/**
 * CanvasLayer — owns the drawing surface and the rAF loop.
 *
 * Performance notes:
 *  - Canvas + 2D context are created ONCE and stored in refs.
 *  - The draw loop pulls the latest landmarks via `getLatest()` (no React state).
 *  - Strokes are drawn incrementally; we never re-render the entire scene.
 *  - Brush settings are read through a ref so prop changes don't restart the loop.
 */
const CanvasLayer = forwardRef(function CanvasLayer(
    { getLatestTracking, brushRef },
    ref,
) {
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });
    const prevPointRef = useRef(null);
    const smoothedRef = useRef({ x: 0, y: 0 });
    const smootherRef = useRef(createMovingAverage(5));
    const gestureOutRef = useRef({ isDrawing: false, fingerPosition: { x: 0, y: 0 } });
    const rafRef = useRef(0);

    useImperativeHandle(ref, () => ({
        clear() {
            const ctx = ctxRef.current;
            const { w, h, dpr } = sizeRef.current;
            if (!ctx) return;
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, w * dpr, h * dpr);
            ctx.restore();
            prevPointRef.current = null;
            smootherRef.current.reset();
        },
    }));

    // Initialize canvas + context once; handle resize.
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
        if (!ctx) return;
        ctxRef.current = ctx;

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const w = canvas.clientWidth;
            const h = canvas.clientHeight;
            canvas.width = Math.floor(w * dpr);
            canvas.height = Math.floor(h * dpr);
            sizeRef.current = { w, h, dpr };
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
        };
        resize();
        window.addEventListener("resize", resize);
        return () => window.removeEventListener("resize", resize);
    }, []);

    useEffect(() => {
        let lastDrawing = false;
        let lastMode = null; // 'draw' | 'erase'

        const loop = () => {
            const ctx = ctxRef.current;
            if (!ctx) {
                rafRef.current = requestAnimationFrame(loop);
                return;
            }
            const tracking = getLatestTracking();
            if (tracking.isHandDetected && tracking.landmarks) {
                const g = readGesture(tracking.landmarks, gestureOutRef.current);
                const { w, h, dpr } = sizeRef.current;
                const mapped = mapNormalizedToCanvas(g.fingerPosition.x, g.fingerPosition.y, w, h, dpr);

                if (g.isClearing || g.isDrawing) {
                    const currentMode = g.isClearing ? 'erase' : 'draw';
                    
                    smootherRef.current.push(mapped.x, mapped.y);
                    const sm = smootherRef.current.value(smoothedRef.current);

                    // Reset origin point if we just started or switched modes
                    if (!lastDrawing || !prevPointRef.current || lastMode !== currentMode) {
                        prevPointRef.current = { x: sm.x, y: sm.y };
                        lastMode = currentMode;
                    } else {
                        const brush = brushRef.current;
                        ctx.beginPath();
                        ctx.moveTo(prevPointRef.current.x, prevPointRef.current.y);
                        ctx.lineTo(sm.x, sm.y);
                        
                        if (g.isClearing) {
                            ctx.globalCompositeOperation = "destination-out";
                            // Ukuran penghapus dibuat lebih besar agar terasa seperti menghapus dengan tangan
                            ctx.lineWidth = brush.size * dpr * 8; 
                            ctx.strokeStyle = "rgba(0,0,0,1)";
                        } else {
                            ctx.globalCompositeOperation = "source-over";
                            ctx.lineWidth = brush.size * dpr;
                            ctx.strokeStyle = brush.color;
                        }
                        
                        ctx.stroke();
                        prevPointRef.current.x = sm.x;
                        prevPointRef.current.y = sm.y;
                    }
                    lastDrawing = true;
                } else {
                    if (lastDrawing) {
                        prevPointRef.current = null;
                        smootherRef.current.reset();
                        lastMode = null;
                        ctx.globalCompositeOperation = "source-over"; // Reset ke default
                    }
                    lastDrawing = false;
                }
            } else {
                prevPointRef.current = null;
                lastDrawing = false;
            }
            rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(rafRef.current);
    }, [getLatestTracking, brushRef]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full"
            style={{ touchAction: "none" }}
        />
    );
});

export default CanvasLayer;
