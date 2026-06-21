import AsyncStorage from "@react-native-async-storage/async-storage";
import { applyDecay, defaultPetStats, PetStats } from "./petstats";

const PET_STORAGE_KEY = "pet_stats";

export async function loadPetStats(): Promise<PetStats> {
  const saved = await AsyncStorage.getItem(PET_STORAGE_KEY);

  if (!saved) {
    return defaultPetStats;
  }

  return applyDecay(JSON.parse(saved));
}

export async function savePetStats(stats: PetStats) {
  await AsyncStorage.setItem(PET_STORAGE_KEY, JSON.stringify(stats));
}