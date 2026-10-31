// Decorative media frames are clipped canvases, never scroll containers.
// The guard also covers older Safari versions without overflow: clip.
export function keepMediaFrameUnscrolled(frame: { scrollTop: number; scrollLeft: number }) {
  if (frame.scrollTop !== 0) frame.scrollTop = 0;
  if (frame.scrollLeft !== 0) frame.scrollLeft = 0;
}
