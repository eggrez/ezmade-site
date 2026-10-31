export function prefersNativeVideoControls(device: {
  userAgent: string;
  platform: string;
  maxTouchPoints: number;
}) {
  return /iPad|iPhone|iPod/i.test(device.userAgent) ||
    (device.platform === "MacIntel" && device.maxTouchPoints > 1);
}

export function playbackErrorMessage(error: { name?: string; code?: number }) {
  if (error.name === "AbortError" || error.code === 1) return null;
  if (error.name === "NotAllowedError") return "Please press play in the video controls.";
  if (error.name === "NotSupportedError" || error.code === 4) {
    return "This video could not be opened. Please try again or open it directly.";
  }
  if (error.code === 3) return "The video could not be played. Please try opening it directly.";
  return "The video could not load. Please check your connection and try again.";
}

// Keep both calls inside the user's click; awaiting load/readiness loses iOS activation.
export function requestVideoPlayback(
  video: Pick<HTMLVideoElement, "load" | "play" | "error" | "muted" | "volume">,
  retry = false,
  preferences?: { muted: boolean; volume: number; nativeVolumeControl: boolean },
) {
  if (preferences) {
    video.muted = preferences.muted;
    if (!preferences.nativeVolumeControl) video.volume = preferences.volume;
  }
  if (retry || video.error) video.load();
  return video.play();
}
