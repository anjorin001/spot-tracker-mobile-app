import AsyncStorage from "@react-native-async-storage/async-storage";
import { SPOTS_KEY } from "@/constants/storage";
import { Spot } from "@/types/spot";

export async function getSpots(): Promise<Spot[]> {
  try {
    const raw = await AsyncStorage.getItem(SPOTS_KEY);
    return raw ? (JSON.parse(raw) as Spot[]) : [];
  } catch (e) {
    console.error("getSpots failed", e);
    return [];
  }
}

async function persist(spots: Spot[]): Promise<void> {
  await AsyncStorage.setItem(SPOTS_KEY, JSON.stringify(spots));
}

export async function createSpot(
  input: Omit<Spot, "id" | "createdAt" | "updatedAt">
): Promise<Spot> {
  const spots = await getSpots();
  const now = Date.now();
  const spot: Spot = { ...input, id: String(now), createdAt: now, updatedAt: now };
  await persist([spot, ...spots]);
  return spot;
}

export async function updateSpot(id: string, patch: Partial<Spot>): Promise<void> {
  const spots = await getSpots();
  await persist(
    spots.map((s) => (s.id === id ? { ...s, ...patch, updatedAt: Date.now() } : s))
  );
}

export async function deleteSpot(id: string): Promise<void> {
  const spots = await getSpots();
  await persist(spots.filter((s) => s.id !== id));
}

export async function getSpot(id: string): Promise<Spot | undefined> {
  return (await getSpots()).find((s) => s.id === id);
}