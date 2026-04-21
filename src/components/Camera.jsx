import { forwardRef } from "react";

/**
 * Camera — thin presentational wrapper over a <video> element.
 * The element is mirrored visually and kept at low opacity; it's only a frame source.
 */
const Camera = forwardRef(function Camera({ className = "" }, ref) {
    return (
        <video
            ref={ref}
            autoPlay
            playsInline
            muted
            className={className}
            style={{ transform: "scaleX(-1)" }}
        />
    );
});

export default Camera;
