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

const serverSyncWellness = async (petStats: PetStats) => {
    const token = await AsyncStorage.getItem("auth_token");
    if (!token) {
      console.error("No auth token found. User may not be logged in.");
      return;
    }
    try {
    const response = await fetch(
        "http://ec2-18-144-66-250.us-west-1.compute.amazonaws.com:5000/wellness/updateWellness",
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`

            },
            body: JSON.stringify({
                food: petStats.hunger,
                water: petStats.hydration,
                energy: petStats.energy
            })
        }
    );

    const data = await response.json();

    console.log(data);
  } catch (error) {
    console.error("Error syncing wellness data:", error);
  }
};

export async function savePetStats(stats: PetStats) {
  await AsyncStorage.setItem(PET_STORAGE_KEY, JSON.stringify(stats));
  try {
  await serverSyncWellness(stats);
  } catch (error) {
    console.error("Sync failed:", error);
  }
}
