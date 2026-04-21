import { useEffect, useRef } from "react";
import { Hands } from "@mediapipe/hands";

/**
 * useHandTracking — adapter hook.
 *
 * Uses MediaPipe Hands to track the user's hand via webcam.
 */
export function useHandTracking({ videoRef, enabled = true }) {
    const landmarksRef = useRef(null);
    const stateRef = useRef({ isHandDetected: false });

    useEffect(() => {
        if (!enabled) return;
        const video = videoRef.current;
        if (!video) return;

        let raf = 0;
        let isProcessing = false;

        const hands = new Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        hands.onResults((results) => {
            if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                landmarksRef.current = results.multiHandLandmarks[0];
                stateRef.current.isHandDetected = true;
            } else {
                stateRef.current.isHandDetected = false;
            }
            isProcessing = false;
        });

        const tick = async () => {
            // Only process if the video has data and isn't paused
            if (video.readyState >= 2 && !isProcessing && !video.paused) {
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

        return () => {
            cancelAnimationFrame(raf);
            hands.close();
        };
    }, [videoRef, enabled]);

    // Stable accessor — never causes a re-render.
    const getLatest = () => ({
        landmarks: landmarksRef.current,
        isHandDetected: stateRef.current.isHandDetected,
    });

    return { getLatest };
}
