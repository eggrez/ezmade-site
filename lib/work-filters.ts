export const workFilterIds = ["all", "direction", "color-grading", "editing", "sound-design", "3d"] as const;
export type WorkFilterId = typeof workFilterIds[number];

export function getWorkFilter(value: unknown): WorkFilterId {
  return typeof value === "string" && workFilterIds.includes(value as WorkFilterId)
    ? value as WorkFilterId
    : "all";
}
