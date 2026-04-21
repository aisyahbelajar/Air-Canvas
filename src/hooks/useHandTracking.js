import { useEffect, useRef } from "react";

export function useHandTracking({ videoRef, enabled = true }) {
    const landmarksRef = useRef(null);
    const stateRef = useRef({ isHandDetected: false });

    useEffect(() => {
        if (!enabled) return;
        if (typeof window === "undefined") return; // 🔥 SSR guard

        const video = videoRef.current;
        if (!video) return;

        let raf = 0;
        let isProcessing = false;
        let hands = null;

        const init = async () => {
            // 🔥 dynamic import (AMAN untuk SSR)
            const mod = await import("@mediapipe/hands");
            const Hands = mod.Hands;

            hands = new Hands({
                locateFile: (file) =>
                    `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
            });

            hands.setOptions({
                maxNumHands: 1,
                modelComplexity: 1,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5,
            });

            hands.onResults((results) => {
                if (results.multiHandLandmarks?.length > 0) {
                    landmarksRef.current = results.multiHandLandmarks[0];
                    stateRef.current.isHandDetected = true;
                } else {
                    stateRef.current.isHandDetected = false;
                }
                isProcessing = false;
            });

            const tick = async () => {
                if (
                    video.readyState >= 2 &&
                    !isProcessing &&
                    !video.paused
                ) {
                    isProcessing = true;
                    try {
                        await hands.send({ image: video });
                    } catch (e) {
                        console.error("MediaPipe error:", e);
                        isProcessing = false;
                    }
                }
                raf = requestAnimationFrame(tick);
            };

            raf = requestAnimationFrame(tick);
        };

        init();

        return () => {
            cancelAnimationFrame(raf);
            hands?.close();
        };
    }, [videoRef, enabled]);

    const getLatest = () => ({
        landmarks: landmarksRef.current,
        isHandDetected: stateRef.current.isHandDetected,
    });

    return { getLatest };
}