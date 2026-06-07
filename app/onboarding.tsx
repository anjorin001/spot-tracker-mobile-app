import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  Text,
  View,
  useWindowDimensions,
  StyleSheet,
} from "react-native";
import { ONBOARDING_KEY } from "@/constants/storage";

const SLIDES = [
  {
    key: "1",
    emoji: "📍",
    accent: "#eef2ff",
    emojiBg: "#c7d2fe",
    title: "Log your spots",
    body: "Save places you visit with a photo and notes — all on your device.",
  },
  {
    key: "2",
    emoji: "🗺️",
    accent: "#f0fdf4",
    emojiBg: "#bbf7d0",
    title: "Pin the location",
    body: "We capture GPS coordinates automatically so you never lose a place.",
  },
  {
    key: "3",
    emoji: "✨",
    accent: "#fefce8",
    emojiBg: "#fde68a",
    title: "Never forget",
    body: "Your spots live on your device, always available — even offline.",
  },
];

export default function Onboarding() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  const finish = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    router.replace("/(tabs)" as any);
  };

  const slide = SLIDES[index];

  return (
    <View style={[styles.root, { backgroundColor: slide.accent }]}>
      {/* Slides */}
      <FlatList
        ref={listRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(i) => i.key}
        onMomentumScrollEnd={(e) =>
          setIndex(Math.round(e.nativeEvent.contentOffset.x / width))
        }
        renderItem={({ item }) => (
          <View style={[{ width }, styles.slide]}>
            {/* Accent circle */}
            <View
              style={[
                styles.emojiCircle,
                { backgroundColor: item.emojiBg },
              ]}
            >
              <Text style={styles.emoji}>{item.emoji}</Text>
            </View>

            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
          </View>
        )}
      />

      {/* Dot indicators */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === index ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>

      {/* Skip link */}
      {index < SLIDES.length - 1 && (
        <Pressable onPress={finish} style={styles.skip}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      )}

      {/* CTA Button */}
      <Pressable
        onPress={() =>
          index === SLIDES.length - 1
            ? finish()
            : listRef.current?.scrollToIndex({ index: index + 1 })
        }
        style={styles.cta}
      >
        <Text style={styles.ctaText}>
          {index === SLIDES.length - 1 ? "Get started →" : "Next"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingBottom: 40,
    paddingTop: 60,
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 36,
    gap: 20,
  },
  emojiCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  emoji: {
    fontSize: 52,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0f172a",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  body: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 24,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingVertical: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: "#4f46e5",
  },
  dotInactive: {
    width: 8,
    backgroundColor: "#cbd5e1",
  },
  skip: {
    alignSelf: "center",
    marginBottom: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  skipText: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "500",
  },
  cta: {
    marginHorizontal: 32,
    borderRadius: 18,
    backgroundColor: "#4f46e5",
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: "#4f46e5",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  ctaText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});