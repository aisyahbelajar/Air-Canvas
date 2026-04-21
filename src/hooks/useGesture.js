/**
 * useGesture — pure function-style helper (not a stateful hook by design).
 *
 * Heuristic:
 *   - Index finger extended  (lm[8].y  < lm[6].y)
 *   - Middle finger folded   (lm[12].y > lm[10].y)
 *   => "draw" gesture, fingerPosition = lm[8].
 *
 * Operates on the mutable landmarks buffer with zero allocations beyond the
 * returned object (caller may reuse it via `out`).
 */
export function readGesture(landmarks, out = { isDrawing: false, isClearing: false, fingerPosition: { x: 0, y: 0 } }) {
    if (!landmarks) {
        out.isDrawing = false;
        out.isClearing = false;
        return out;
    }
    
    const tipIndex = landmarks[8];
    const pipIndex = landmarks[6];
    const tipMiddle = landmarks[12];
    const pipMiddle = landmarks[10];
    const tipRing = landmarks[16];
    const pipRing = landmarks[14];
    const tipPinky = landmarks[20];
    const pipPinky = landmarks[18];

    // Cek apakah jari-jari terentang (berdasarkan koordinat Y)
    const indexExtended = tipIndex.y < pipIndex.y;
    const middleExtended = tipMiddle.y < pipMiddle.y;
    const ringExtended = tipRing.y < pipRing.y;
    const pinkyExtended = tipPinky.y < pipPinky.y;

    // 5 Jari terbuka (atau 4 jari utama terbuka) = Menghapus
    const isOpenHand = indexExtended && middleExtended && ringExtended && pinkyExtended;
    
    // Mengepal (semua jari ditekuk) = Hold (otomatis isDrawing dan isClearing false)
    
    // Menggambar: Hanya Telunjuk yang terentang, sisanya ditekuk
    const isPointing = indexExtended && !middleExtended && !ringExtended && !pinkyExtended;

    out.isClearing = isOpenHand;
    out.isDrawing = isPointing;
    
    out.fingerPosition.x = tipIndex.x;
    out.fingerPosition.y = tipIndex.y;
    return out;
}
