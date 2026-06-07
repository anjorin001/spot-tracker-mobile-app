import * as Location from "expo-location";

export interface Geo {
  latitude: number;
  longitude: number;
  address?: string;
}

export async function captureLocation(): Promise<Geo | null> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") return null;

  const pos = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  const { latitude, longitude } = pos.coords;

  let address: string | undefined;
  try {
    const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (place)
      address = [place.name, place.city, place.region]
        .filter(Boolean)
        .join(", ");
  } catch {
    /* reverse geocode is best-effort */
  }

  return { latitude, longitude, address };
}
