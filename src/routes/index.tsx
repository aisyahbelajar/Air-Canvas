import { createFileRoute } from "@tanstack/react-router";
import AirCanvasApp from "../components/AirCanvasApp";

export const Route = createFileRoute("/")({
    component: Index,
    head: () => ({
        meta: [
            { title: "AirCanvas — Gesture-Based Drawing" },
            {
                name: "description",
                content:
                    "Draw on a canvas with hand gestures via webcam. Real-time, low-latency, no mouse required.",
            },
        ],
    }),
});

function Index() {
    return <AirCanvasApp />;
}
