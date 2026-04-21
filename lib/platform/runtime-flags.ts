export const PWA_ENABLED = process.env.NEXT_PUBLIC_ENABLE_PWA === "true";

export function isPwaEnabled(): boolean {
  return PWA_ENABLED;
}

export function canUseServiceWorkerRuntime(): boolean {
  return typeof window !== "undefined" && PWA_ENABLED && "serviceWorker" in navigator;
}
