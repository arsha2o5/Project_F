import AsyncStorage from "@react-native-async-storage/async-storage";

export type PetStats = {
    hunger: number; // 0 to 100
    hydration: number; // 0 to 2000
    energy: number; // 0 to 100
    lastUpdatedAt: string; // timestamp of last update
};

export const defaultPetStats: PetStats = {
    hunger: 0,
    hydration: 0,
    energy: 50,
    lastUpdatedAt: new Date().toISOString(),
};

export const loadServerWellness = async () => {
    const token = await AsyncStorage.getItem("auth_token");
    const response = await fetch("http://192.168.1.78:5000/wellness/getWellnessById", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        return;
    }

    const data = await response.json();
    if (!data) {
        return;
    }

    const stats: PetStats = {
        hunger: data.food ?? 0,
        hydration: data.water ?? 0,
        energy: data.energy ?? 50,
        lastUpdatedAt: new Date().toISOString(),
    };

    await AsyncStorage.setItem("pet_stats", JSON.stringify(stats));
};

const clamp = (value: number) => { return Math.min(Math.max(value, 0), 100); };

export function applyDecay(stats: PetStats): PetStats {
  const now = Date.now();
  const last = new Date(stats.lastUpdatedAt).getTime();
  const hoursPassed = Math.max(0, (now - last) / (1000 * 60 * 60));

  return {
    hunger: clamp(stats.hunger - hoursPassed * 5554.1),
    hydration: Math.min(Math.max((stats.hydration - hoursPassed * 55583.3), 0), 2000),
    energy: clamp(stats.energy - hoursPassed * 5556.25),
    lastUpdatedAt: new Date(now).toISOString(),
  };
}
