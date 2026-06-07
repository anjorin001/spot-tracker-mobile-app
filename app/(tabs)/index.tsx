import { useCallback, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Link, useFocusEffect, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { useSpots } from "@/hooks/useSpot";
import type { Spot } from "@/types/spot";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Spot card (list view) ────────────────────────────────────────────────────

function SpotCard({ item }: { item: Spot }) {
  const date = new Date(item.createdAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <Link href={`/spot/${item.id}` as any} asChild>
      <Pressable style={styles.card}>
        {item.imageUri ? (
          <Image source={{ uri: item.imageUri }} style={styles.cardImage} />
        ) : (
          <View style={styles.cardImagePlaceholder}>
            <Ionicons name="image-outline" size={28} color="#cbd5e1" />
          </View>
        )}
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title}
          </Text>
          {item.address ? (
            <View style={styles.cardMeta}>
              <Ionicons name="location-outline" size={12} color="#4f46e5" />
              <Text style={styles.cardAddress} numberOfLines={1}>
                {item.address}
              </Text>
            </View>
          ) : null}
          <Text style={styles.cardDate}>{date}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
      </Pressable>
    </Link>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyEmoji}>📍</Text>
      <Text style={styles.emptyTitle}>No spots yet</Text>
      <Text style={styles.emptyBody}>
        Tap the Add tab to log your first spot.
      </Text>
    </View>
  );
}

// ─── Map callout card (slides up when you tap a pin) ─────────────────────────

function MapCallout({
  spot,
  slideAnim,
}: {
  spot: Spot;
  slideAnim: Animated.Value;
}) {
  const router = useRouter();

  return (
    <Animated.View
      style={[
        styles.callout,
        { transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={styles.calloutInner}>
        {spot.imageUri ? (
          <Image source={{ uri: spot.imageUri }} style={styles.calloutImage} />
        ) : (
          <View style={styles.calloutImagePlaceholder}>
            <Ionicons name="image-outline" size={28} color="#cbd5e1" />
          </View>
        )}
        <View style={styles.calloutBody}>
          <Text style={styles.calloutTitle} numberOfLines={1}>
            {spot.title}
          </Text>
          {spot.address ? (
            <View style={styles.calloutMeta}>
              <Ionicons name="location-outline" size={11} color="#4f46e5" />
              <Text style={styles.calloutAddress} numberOfLines={2}>
                {spot.address}
              </Text>
            </View>
          ) : null}
        </View>
        <Pressable
          style={styles.calloutBtn}
          onPress={() => router.push(`/spot/${spot.id}` as any)}
        >
          <Text style={styles.calloutBtnText}>View</Text>
          <Ionicons name="arrow-forward" size={14} color="#ffffff" />
        </Pressable>
      </View>
      {/* Drag handle */}
      <View style={styles.calloutHandle} />
    </Animated.View>
  );
}

// ─── Main feed screen ─────────────────────────────────────────────────────────

type ViewMode = "list" | "map";

export default function Feed() {
  const { spots, refresh } = useSpots();
  const [mode, setMode] = useState<ViewMode>("list");
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const slideAnim = useRef(new Animated.Value(300)).current;
  const mapRef = useRef<MapView>(null);

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const openCallout = (spot: Spot) => {
    setSelectedSpot(spot);
    // Animate the card up
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      damping: 18,
      stiffness: 200,
    }).start();
    // Pan map to the selected pin
    if (spot.latitude != null && spot.longitude != null && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: spot.latitude - 0.002,
          longitude: spot.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        },
        400
      );
    }
  };

  const closeCallout = () => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setSelectedSpot(null));
  };

  const switchToMap = () => {
    setMode("map");
    setSelectedSpot(null);
    slideAnim.setValue(300);
    // Fit all spots on the map
    const withCoords = spots.filter(
      (s) => s.latitude != null && s.longitude != null
    );
    if (withCoords.length > 0 && mapRef.current) {
      setTimeout(() => {
        mapRef.current?.fitToCoordinates(
          withCoords.map((s) => ({
            latitude: s.latitude!,
            longitude: s.longitude!,
          })),
          { edgePadding: { top: 80, right: 40, bottom: 160, left: 40 }, animated: true }
        );
      }, 300);
    }
  };

  // Spots that can appear on the map
  const mappableSpots = spots.filter(
    (s) => s.latitude != null && s.longitude != null
  );

  return (
    <View style={styles.root}>
      {/* ── Header ──────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerWordmark}>SpotLog</Text>
          <Text style={styles.headerSub}>Your saved places</Text>
        </View>

        {/* List / Map toggle pill */}
        <View style={styles.toggle}>
          <Pressable
            onPress={() => setMode("list")}
            style={[styles.toggleBtn, mode === "list" && styles.toggleBtnActive]}
          >
            <Ionicons
              name="list-outline"
              size={16}
              color={mode === "list" ? "#ffffff" : "#64748b"}
            />
            <Text
              style={[
                styles.toggleLabel,
                { color: mode === "list" ? "#ffffff" : "#64748b" },
              ]}
            >
              List
            </Text>
          </Pressable>
          <Pressable
            onPress={switchToMap}
            style={[styles.toggleBtn, mode === "map" && styles.toggleBtnActive]}
          >
            <Ionicons
              name="map-outline"
              size={16}
              color={mode === "map" ? "#ffffff" : "#64748b"}
            />
            <Text
              style={[
                styles.toggleLabel,
                { color: mode === "map" ? "#ffffff" : "#64748b" },
              ]}
            >
              Map
            </Text>
          </Pressable>
        </View>
      </View>

      {/* ── List view ───────────────────────────────────────────── */}
      {mode === "list" && (
        <FlatList
          data={spots}
          keyExtractor={(s) => s.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState />}
          renderItem={({ item }) => <SpotCard item={item} />}
        />
      )}

      {/* ── Map view ────────────────────────────────────────────── */}
      {mode === "map" && (
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFill}
            provider={PROVIDER_DEFAULT}
            showsUserLocation
            showsMyLocationButton={false}
            initialRegion={{
              latitude: mappableSpots[0]?.latitude ?? 51.505,
              longitude: mappableSpots[0]?.longitude ?? -0.09,
              latitudeDelta: 0.08,
              longitudeDelta: 0.08,
            }}
            onPress={closeCallout}
          >
            {mappableSpots.map((spot) => (
              <Marker
                key={spot.id}
                coordinate={{
                  latitude: spot.latitude!,
                  longitude: spot.longitude!,
                }}
                onPress={(e) => {
                  e.stopPropagation();
                  openCallout(spot);
                }}
              >
                {/* Custom pin */}
                <View style={styles.pin}>
                  {spot.imageUri ? (
                    <Image
                      source={{ uri: spot.imageUri }}
                      style={styles.pinImage}
                    />
                  ) : (
                    <View style={styles.pinIcon}>
                      <Ionicons name="location" size={16} color="#ffffff" />
                    </View>
                  )}
                  <View style={styles.pinTail} />
                </View>
              </Marker>
            ))}
          </MapView>

          {/* No location spots warning */}
          {mappableSpots.length === 0 && (
            <View style={styles.mapEmpty}>
              <Ionicons name="location-outline" size={32} color="#94a3b8" />
              <Text style={styles.mapEmptyText}>
                None of your spots have a location yet.{"\n"}Add location when saving a spot.
              </Text>
            </View>
          )}

          {/* Slide-up callout card */}
          {selectedSpot && (
            <MapCallout spot={selectedSpot} slideAnim={slideAnim} />
          )}
        </View>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  headerWordmark: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 13,
    color: "#94a3b8",
    marginTop: 1,
  },
  // Toggle pill
  toggle: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderRadius: 22,
    padding: 3,
    gap: 2,
  },
  toggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
  },
  toggleBtnActive: {
    backgroundColor: "#4f46e5",
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
  // List view
  list: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 120,
    gap: 12,
  },
  // Cards
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 14,
    shadowColor: "#0f172a",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardImage: {
    width: 66,
    height: 66,
    borderRadius: 14,
  },
  cardImagePlaceholder: {
    width: 66,
    height: 66,
    borderRadius: 14,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  cardAddress: {
    fontSize: 12,
    color: "#4f46e5",
    flex: 1,
  },
  cardDate: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 2,
  },
  // Empty
  empty: {
    alignItems: "center",
    marginTop: 80,
    gap: 10,
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
  },
  emptyBody: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 22,
  },
  // Map view
  mapContainer: {
    flex: 1,
  },
  mapEmpty: {
    position: "absolute",
    top: "40%",
    left: 40,
    right: 40,
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 20,
    padding: 24,
  },
  mapEmptyText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 22,
  },
  // Custom map pin
  pin: {
    alignItems: "center",
  },
  pinImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: "#4f46e5",
  },
  pinIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#4f46e5",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2.5,
    borderColor: "#ffffff",
    shadowColor: "#4f46e5",
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  pinTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#4f46e5",
    marginTop: -1,
  },
  // Slide-up callout
  callout: {
    position: "absolute",
    bottom: 110,
    left: 16,
    right: 16,
  },
  calloutHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#e2e8f0",
    alignSelf: "center",
    marginTop: 6,
  },
  calloutInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 14,
    shadowColor: "#0f172a",
    shadowOpacity: 0.14,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  calloutImage: {
    width: 60,
    height: 60,
    borderRadius: 14,
  },
  calloutImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  calloutBody: {
    flex: 1,
    gap: 5,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  calloutMeta: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 3,
  },
  calloutAddress: {
    flex: 1,
    fontSize: 12,
    color: "#4f46e5",
    lineHeight: 16,
  },
  calloutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#4f46e5",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    shadowColor: "#4f46e5",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  calloutBtnText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
});