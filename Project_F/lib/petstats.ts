export type PetStats = {
    hunger: number; // 0 to 100
    hydration: number; // 0 to 2000
    hygiene: number; // 0 to 100
    energy: number; // 0 to 100
    lastUpdatedAt: string; // timestamp of last update
};

export const defaultPetStats: PetStats = {
    hunger: 0,
    hydration: 0,
    hygiene: 50,
    energy: 50,
    lastUpdatedAt: new Date().toISOString(),
};

const clamp = (value: number) => { return Math.min(Math.max(value, 0), 100); };

export function applyDecay(stats: PetStats): PetStats {
  const now = Date.now();
  const last = new Date(stats.lastUpdatedAt).getTime();
  const hoursPassed = Math.max(0, (now - last) / (1000 * 60 * 60));

  return {
    hunger: clamp(stats.hunger - hoursPassed * 8300),
    hydration: Math.min(Math.max((stats.hydration - hoursPassed * 8300), 0), 2000),
    energy: clamp(stats.energy - hoursPassed * 1),
    hygiene: clamp(stats.hygiene - hoursPassed * 0.75),
    lastUpdatedAt: new Date(now).toISOString(),
  };
}