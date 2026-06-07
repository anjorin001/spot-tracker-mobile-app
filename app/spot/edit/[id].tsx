import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { pickImage } from "@/lib/image";
import { captureLocation, type Geo } from "@/lib/location";
import { getSpot, updateSpot } from "@/lib/storage";
import type { Spot } from "@/types/spot";

export default function EditSpot() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [spot, setSpot] = useState<Spot | undefined>();
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [geo, setGeo] = useState<Geo | null>(null);
  const [saving, setSaving] = useState(false);
  const [locLoading, setLocLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    getSpot(id).then((s) => {
      if (!s) return;
      setSpot(s);
      setTitle(s.title);
      setNotes(s.notes ?? "");
      setImageUri(s.imageUri);
      if (s.latitude != null && s.longitude != null) {
        setGeo({
          latitude: s.latitude,
          longitude: s.longitude,
          address: s.address,
        });
      }
    });
  }, [id]);

  const onPickImage = async () => {
    const uri = await pickImage();
    if (uri) setImageUri(uri);
  };

  const onCaptureLocation = async () => {
    setLocLoading(true);
    const g = await captureLocation();
    setGeo(g);
    setLocLoading(false);
  };

  const onRemoveImage = () => {
    Alert.alert("Remove photo?", "The photo will be removed from this spot.", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => setImageUri(undefined) },
    ]);
  };

  const onSave = async () => {
    if (!title.trim() || !id) return;
    setSaving(true);
    await updateSpot(id, {
      title: title.trim(),
      notes: notes.trim(),
      imageUri,
      latitude: geo?.latitude,
      longitude: geo?.longitude,
      address: geo?.address,
    });
    setSaving(false);
    router.back();
  };

  if (!spot) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  const locationLabel = geo
    ? geo.address ?? `${geo.latitude.toFixed(4)}, ${geo.longitude.toFixed(4)}`
    : null;

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header — shown by stack navigator; this is the screen body */}
      <ScrollView
        contentContainerStyle={styles.form}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title */}
        <View style={styles.field}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Hidden beach, Great café…"
            placeholderTextColor="#94a3b8"
            style={styles.input}
          />
        </View>

        {/* Notes */}
        <View style={styles.field}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="What made this place special?"
            placeholderTextColor="#94a3b8"
            multiline
            style={[styles.input, styles.inputMultiline]}
          />
        </View>

        {/* Photo */}
        <View style={styles.field}>
          <Text style={styles.label}>Photo</Text>
          {imageUri ? (
            <View>
              <Image source={{ uri: imageUri }} style={styles.photoPreview} />
              <View style={styles.photoOverlay}>
                <Pressable onPress={onPickImage} style={styles.overlayBtn}>
                  <Ionicons name="camera-outline" size={16} color="#ffffff" />
                  <Text style={styles.overlayBtnText}>Change</Text>
                </Pressable>
                <Pressable onPress={onRemoveImage} style={[styles.overlayBtn, styles.overlayBtnDanger]}>
                  <Ionicons name="trash-outline" size={16} color="#ffffff" />
                  <Text style={styles.overlayBtnText}>Remove</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable onPress={onPickImage} style={styles.photoPlaceholder}>
              <Ionicons name="image-outline" size={32} color="#94a3b8" />
              <Text style={styles.photoPlaceholderText}>Tap to add a photo</Text>
            </Pressable>
          )}
        </View>

        {/* Location */}
        <View style={styles.field}>
          <Text style={styles.label}>Location</Text>
          {locationLabel ? (
            <View style={styles.locationChip}>
              <Ionicons name="location" size={14} color="#16a34a" />
              <Text style={styles.locationChipText} numberOfLines={1}>
                {locationLabel}
              </Text>
              <Pressable onPress={onCaptureLocation}>
                <Ionicons name="refresh-outline" size={14} color="#16a34a" />
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={onCaptureLocation}
              style={styles.locationBtn}
              disabled={locLoading}
            >
              {locLoading ? (
                <ActivityIndicator size="small" color="#4f46e5" />
              ) : (
                <>
                  <Ionicons name="location-outline" size={18} color="#4f46e5" />
                  <Text style={styles.locationBtnText}>Update location</Text>
                </>
              )}
            </Pressable>
          )}
        </View>
      </ScrollView>

      {/* Sticky Save */}
      <View style={styles.footer}>
        <Pressable
          onPress={onSave}
          disabled={saving || !title.trim()}
          style={[
            styles.saveBtn,
            (!title.trim() || saving) && styles.saveBtnDisabled,
          ]}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={20} color="#ffffff" />
              <Text style={styles.saveBtnText}>Save changes</Text>
            </>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
  },
  form: {
    padding: 24,
    gap: 20,
    paddingBottom: 32,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#0f172a",
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: "top",
    paddingTop: 14,
  },
  photoPlaceholder: {
    height: 140,
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  photoPlaceholderText: {
    fontSize: 14,
    color: "#94a3b8",
  },
  photoPreview: {
    width: "100%",
    height: 200,
    borderRadius: 16,
  },
  photoOverlay: {
    position: "absolute",
    bottom: 10,
    right: 10,
    flexDirection: "row",
    gap: 8,
  },
  overlayBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  overlayBtnDanger: {
    backgroundColor: "rgba(220,38,38,0.75)",
  },
  overlayBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  locationBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#eef2ff",
    borderRadius: 14,
    paddingVertical: 16,
  },
  locationBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4f46e5",
  },
  locationChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  locationChipText: {
    flex: 1,
    fontSize: 13,
    color: "#16a34a",
    fontWeight: "500",
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 12,
    backgroundColor: "#f8fafc",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#4f46e5",
    borderRadius: 18,
    paddingVertical: 18,
    shadowColor: "#4f46e5",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  saveBtnDisabled: {
    opacity: 0.45,
    shadowOpacity: 0,
    elevation: 0,
  },
  saveBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});
