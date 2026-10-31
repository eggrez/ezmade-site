import sources from "./project-image-sources.json";

type Variant = { src: string; width: number; height: number; bytes: number };
const variants = sources as Record<string, Variant[]>;

export function getProjectImageSource(source: string, width = 1280): string {
  if (!source) return source;
  let pathname = source;
  try {
    const url = new URL(source, "https://ezmade.pro");
    pathname = url.pathname === "/_next/image" ? url.searchParams.get("url") || source : url.pathname;
  } catch { /* Keep relative image sources. */ }
  const original = variants[pathname] ? pathname : Object.keys(variants).find(key => variants[key].some(v => v.src === pathname));
  const choices = original ? variants[original] : null;
  return choices?.find(v => v.width >= width)?.src ?? choices?.at(-1)?.src ?? source;
}

export function projectImageLoader({ src, width }: { src: string; width: number }) {
  return getProjectImageSource(src, width);
}

const warmed = new Map<string, Promise<void>>();
export function prepareProjectImage(source: string, width = 1280): Promise<void> {
  const url = getProjectImageSource(source, width);
  const existing = warmed.get(url);
  if (existing) return existing;
  const promise = new Promise<void>((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => { void image.decode().catch(() => undefined).then(resolve); };
    image.onerror = () => { warmed.delete(url); reject(new Error("Could not load project cover")); };
    image.src = url;
  });
  warmed.set(url, promise);
  return promise;
}
