import { useEffect, useRef, useState } from "react";

/**
 * useCamera — initializes a webcam stream once, attaches it to a video element,
 * and cleans up on unmount. Status is React state (UI), the stream/track refs
 * are mutable (no re-renders).
 */
export function useCamera({ width = 640, height = 480 } = {}) {
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const [status, setStatus] = useState("idle"); // idle | requesting | active | error
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        async function init() {
            if (streamRef.current) return;
            setStatus("requesting");
            try {
                if (!navigator.mediaDevices?.getUserMedia) {
                    throw new Error("Camera API not available in this browser.");
                }
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: { ideal: width }, height: { ideal: height }, facingMode: "user" },
                    audio: false,
                });
                if (cancelled) {
                    stream.getTracks().forEach((t) => t.stop());
                    return;
                }
                streamRef.current = stream;
                const video = videoRef.current;
                if (video) {
                    video.srcObject = stream;
                    video.muted = true;
                    video.playsInline = true;
                    await video.play().catch(() => { });
                }
                setStatus("active");
            } catch (err) {
                if (cancelled) return;
                setError(err instanceof Error ? err.message : String(err));
                setStatus("error");
            }
        }

        init();

        return () => {
            cancelled = true;
            const stream = streamRef.current;
            if (stream) {
                stream.getTracks().forEach((t) => t.stop());
                streamRef.current = null;
            }
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        };
    }, [width, height]);

    return { videoRef, status, error };
}
