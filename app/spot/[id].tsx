import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { getSpot, deleteSpot } from "@/lib/storage";
import type { Spot } from "@/types/spot";

export default function SpotDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [spot, setSpot] = useState<Spot | undefined>();

  useEffect(() => {
    if (id) getSpot(id).then(setSpot);
  }, [id]);

  const confirmDelete = () =>
    Alert.alert("Delete spot?", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteSpot(id!);
          router.replace("/(tabs)" as any);
        },
      },
    ]);

  if (!spot) return null;

  const date = new Date(spot.createdAt).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      {/* Hero image */}
      {spot.imageUri ? (
        <Image source={{ uri: spot.imageUri }} style={styles.hero} />
      ) : (
        <View style={styles.heroPlaceholder}>
          <Ionicons name="image-outline" size={48} color="#cbd5e1" />
        </View>
      )}

      {/* Info card */}
      <View style={styles.card}>
        <Text style={styles.title}>{spot.title}</Text>

        {/* Metadata row */}
        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <Ionicons name="calendar-outline" size={13} color="#64748b" />
            <Text style={styles.metaText}>{date}</Text>
          </View>
        </View>

        {spot.address ? (
          <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color="#4f46e5" />
            <Text style={styles.locationText}>{spot.address}</Text>
          </View>
        ) : spot.latitude != null ? (
          <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color="#4f46e5" />
            <Text style={styles.locationText}>
              {spot.latitude.toFixed(5)}, {spot.longitude?.toFixed(5)}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Notes card */}
      {spot.notes ? (
        <View style={styles.notesCard}>
          <View style={styles.notesHeader}>
            <Ionicons name="document-text-outline" size={15} color="#64748b" />
            <Text style={styles.notesLabel}>Notes</Text>
          </View>
          <Text style={styles.notesText}>{spot.notes}</Text>
        </View>
      ) : null}

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable
          onPress={() => router.push(`/spot/edit/${spot.id}` as any)}
          style={[styles.actionBtn, styles.editBtn]}
        >
          <Ionicons name="create-outline" size={18} color="#4f46e5" />
          <Text style={styles.editBtnText}>Edit</Text>
        </Pressable>
        <Pressable onPress={confirmDelete} style={[styles.actionBtn, styles.deleteBtn]}>
          <Ionicons name="trash-outline" size={18} color="#dc2626" />
          <Text style={styles.deleteBtnText}>Delete</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    paddingBottom: 48,
    gap: 16,
  },
  hero: {
    width: "100%",
    height: 280,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroPlaceholder: {
    width: "100%",
    height: 200,
    backgroundColor: "#f1f5f9",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    marginHorizontal: 20,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    gap: 10,
    shadowColor: "#0f172a",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: -0.4,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  metaText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginTop: 4,
  },
  locationText: {
    flex: 1,
    fontSize: 13,
    color: "#4f46e5",
    fontWeight: "500",
    lineHeight: 18,
  },
  notesCard: {
    marginHorizontal: 20,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    gap: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#4f46e5",
    shadowColor: "#0f172a",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  notesHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  notesText: {
    fontSize: 15,
    color: "#334155",
    lineHeight: 24,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginHorizontal: 20,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 16,
    paddingVertical: 16,
  },
  editBtn: {
    backgroundColor: "#eef2ff",
  },
  editBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#4f46e5",
  },
  deleteBtn: {
    backgroundColor: "#fef2f2",
  },
  deleteBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#dc2626",
  },
});