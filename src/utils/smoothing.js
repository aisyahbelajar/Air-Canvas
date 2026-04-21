// Lightweight smoothing helpers — no allocations in hot path beyond returned object.
export function lerp(a, b, t) {
    return a + (b - a) * t;
}

export function lerpPoint(prev, next, t, out) {
    out.x = lerp(prev.x, next.x, t);
    out.y = lerp(prev.y, next.y, t);
    return out;
}

// Simple moving average buffer (fixed size, ring buffer style).
export function createMovingAverage(size = 4) {
    const xs = new Float32Array(size);
    const ys = new Float32Array(size);
    let idx = 0;
    let count = 0;
    return {
        push(x, y) {
            xs[idx] = x;
            ys[idx] = y;
            idx = (idx + 1) % size;
            if (count < size) count++;
        },
        value(out) {
            let sx = 0;
            let sy = 0;
            for (let i = 0; i < count; i++) {
                sx += xs[i];
                sy += ys[i];
            }
            out.x = sx / count;
            out.y = sy / count;
            return out;
        },
        reset() {
            idx = 0;
            count = 0;
        },
    };
}
