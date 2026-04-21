// Maps normalized landmark coords (0..1) to canvas pixel coords.
// Mirrors X because the webcam feed is shown mirrored for natural UX.
export function mapNormalizedToCanvas(nx, ny, width, height, dpr = 1) {
    const x = (1 - nx) * width * dpr;
    const y = ny * height * dpr;
    return {
        x: clamp(x, 0, width * dpr),
        y: clamp(y, 0, height * dpr),
    };
}

export function clamp(v, min, max) {
    return v < min ? min : v > max ? max : v;
}
