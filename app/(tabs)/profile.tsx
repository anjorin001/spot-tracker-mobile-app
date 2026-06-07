import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View, Alert } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ONBOARDING_KEY } from "@/constants/storage";
import { useSpots } from "@/hooks/useSpot";

export default function Profile() {
  const router = useRouter();
  const { spots } = useSpots();

  const resetOnboarding = async () => {
    Alert.alert(
      "Reset onboarding",
      "This will show the onboarding screen on next launch.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem(ONBOARDING_KEY);
            router.replace("/onboarding" as any);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.root}>
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color="#4f46e5" />
        </View>
        <Text style={styles.name}>My SpotLog</Text>
        <Text style={styles.sub}>Your personal place diary</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{spots.length}</Text>
          <Text style={styles.statLabel}>Total Spots</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {spots.filter((s) => s.imageUri).length}
          </Text>
          <Text style={styles.statLabel}>With Photos</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {spots.filter((s) => s.latitude != null).length}
          </Text>
          <Text style={styles.statLabel}>With Location</Text>
        </View>
      </View>

      {/* Settings / Dev section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Developer</Text>

        <Pressable style={styles.row} onPress={resetOnboarding}>
          <View style={styles.rowIcon}>
            <Ionicons name="refresh-outline" size={18} color="#64748b" />
          </View>
          <Text style={styles.rowText}>Reset onboarding</Text>
          <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
        </Pressable>
      </View>

      <Text style={styles.footerNote}>SpotLog • All data stored locally on device</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  avatarSection: {
    alignItems: "center",
    gap: 6,
    marginBottom: 32,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#eef2ff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    shadowColor: "#4f46e5",
    shadowOpacity: 0.15,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  name: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a",
  },
  sub: {
    fontSize: 13,
    color: "#94a3b8",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    gap: 4,
    shadowColor: "#0f172a",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "800",
    color: "#4f46e5",
  },
  statLabel: {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: "600",
    textAlign: "center",
  },
  section: {
    gap: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#0f172a",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#0f172a",
  },
  footerNote: {
    position: "absolute",
    bottom: 130,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 12,
    color: "#cbd5e1",
  },
});