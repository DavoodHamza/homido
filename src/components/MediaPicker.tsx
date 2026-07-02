import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  Text,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { api } from '@/services/api';

// ─── Types ────────────────────────────────────────────────────────
export type MediaType = 'image' | 'video';

interface MediaPickerProps {
  /** Current value URL (existing media or newly uploaded) */
  value?: string;
  /** Called with the final server URL after upload succeeds */
  onUploaded: (url: string) => void;
  /** Allowed media type. Default: 'image' */
  mediaType?: MediaType;
  /** Label shown inside the empty picker */
  label?: string;
}

// ─── Constants ────────────────────────────────────────────────────
const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];
function isVideo(url?: string) {
  if (!url) return false;
  const lower = url.toLowerCase();
  return VIDEO_EXTENSIONS.some((ext) => lower.includes(ext));
}

// ─── Component ────────────────────────────────────────────────────
export default function MediaPicker({
  value,
  onUploaded,
  mediaType = 'image',
  label,
}: MediaPickerProps) {
  const theme = useTheme();
  const [uploading, setUploading] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);

  // ── Request permissions helper ──
  const requestPermissions = async (needsCamera: boolean): Promise<boolean> => {
    if (needsCamera) {
      const cam = await ImagePicker.requestCameraPermissionsAsync();
      if (cam.status !== 'granted') {
        Alert.alert('Permission Required', 'Camera access is needed to take photos/videos.');
        return false;
      }
    } else {
      const lib = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (lib.status !== 'granted') {
        Alert.alert('Permission Required', 'Photo library access is needed to pick media.');
        return false;
      }
    }
    return true;
  };

  // ── Launch picker → upload → callback ──
  const pick = async (source: 'camera' | 'library', type: MediaType) => {
    setSheetVisible(false);

    const ok = await requestPermissions(source === 'camera');
    if (!ok) return;

    let result: ImagePicker.ImagePickerResult;

    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes:
        type === 'video'
          ? ImagePicker.MediaTypeOptions.Videos
          : ImagePicker.MediaTypeOptions.Images,
      allowsEditing: type === 'image',
      quality: type === 'image' ? 0.85 : undefined,
      videoMaxDuration: 120, // 2 min max
    };

    if (source === 'camera') {
      result = await ImagePicker.launchCameraAsync(options);
    } else {
      result = await ImagePicker.launchImageLibraryAsync(options);
    }

    if (result.canceled || !result.assets?.length) return;

    const asset = result.assets[0];
    setUploading(true);

    try {
      let serverUrl: string;
      const mimeType =
        asset.mimeType ||
        (type === 'video' ? 'video/mp4' : 'image/jpeg');

      if (type === 'video') {
        serverUrl = await api.upload.video(asset.uri, asset.fileName ?? undefined, mimeType);
      } else {
        serverUrl = await api.upload.image(asset.uri, asset.fileName ?? undefined, mimeType);
      }

      onUploaded(serverUrl);
    } catch (err: any) {
      Alert.alert('Upload Failed', err.message || 'Could not upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // ── Build sheet options based on allowed mediaType ──
  const sheetOptions: { label: string; icon: keyof typeof Ionicons.glyphMap; action: () => void }[] = [];

  if (mediaType === 'image' || mediaType === 'video') {
    sheetOptions.push({
      label: 'Take Photo',
      icon: 'camera',
      action: () => pick('camera', 'image'),
    });
  }
  if (mediaType === 'video') {
    sheetOptions.push({
      label: 'Record Video',
      icon: 'videocam',
      action: () => pick('camera', 'video'),
    });
  }
  sheetOptions.push({
    label: mediaType === 'video' ? 'Choose from Library' : 'Choose Photo',
    icon: 'images',
    action: () => pick('library', 'image'),
  });
  if (mediaType === 'video') {
    sheetOptions.push({
      label: 'Choose Video',
      icon: 'film',
      action: () => pick('library', 'video'),
    });
  }
  if (value) {
    sheetOptions.push({
      label: 'Remove Media',
      icon: 'trash-outline',
      action: () => {
        setSheetVisible(false);
        onUploaded('');
      },
    });
  }

  const hasMedia = !!value;
  const showVideo = isVideo(value);

  return (
    <View style={styles.wrapper}>
      <Pressable
        style={[
          styles.pickerArea,
          {
            borderColor: hasMedia ? theme.primary : theme.border,
            backgroundColor: hasMedia ? theme.primary + '08' : theme.background,
          },
        ]}
        onPress={() => setSheetVisible(true)}
        disabled={uploading}
      >
        {uploading ? (
          <View style={styles.uploadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.uploadingText, { color: theme.textSecondary }]}>
              Uploading...
            </Text>
          </View>
        ) : hasMedia && !showVideo ? (
          <>
            <Image source={{ uri: value }} style={styles.previewImage} />
            <View style={[styles.editOverlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
              <Ionicons name="camera" size={20} color="#FFF" />
              <Text style={styles.editOverlayText}>Change</Text>
            </View>
          </>
        ) : hasMedia && showVideo ? (
          <View style={styles.videoPreviewer}>
            <Ionicons name="play-circle" size={48} color={theme.primary} />
            <Text style={[styles.videoLabel, { color: theme.textSecondary }]}>
              Video uploaded ✓
            </Text>
            <Text style={[styles.videoChange, { color: theme.primary }]}>Tap to change</Text>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={[styles.iconBg, { backgroundColor: theme.primary + '15' }]}>
              <Ionicons
                name={mediaType === 'video' ? 'videocam-outline' : 'image-outline'}
                size={32}
                color={theme.primary}
              />
            </View>
            <Text style={[styles.emptyLabel, { color: theme.text }]}>
              {label || (mediaType === 'video' ? 'Add Photo / Video' : 'Add Photo')}
            </Text>
            <Text style={[styles.emptyHint, { color: theme.textSecondary }]}>
              Camera or library
            </Text>
          </View>
        )}
      </Pressable>

      {/* Action Sheet Modal */}
      <Modal
        visible={sheetVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSheetVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setSheetVisible(false)}>
          <View style={[styles.sheet, { backgroundColor: theme.card }]}>
            <View style={[styles.sheetHandle, { backgroundColor: theme.border }]} />
            <Text style={[styles.sheetTitle, { color: theme.text }]}>Select Media Source</Text>

            {sheetOptions.map((opt) => (
              <Pressable
                key={opt.label}
                style={[
                  styles.sheetRow,
                  {
                    borderBottomColor: theme.border,
                    borderBottomWidth: 1,
                  },
                  opt.label === 'Remove Media' && { borderBottomWidth: 0 },
                ]}
                onPress={opt.action}
              >
                <View
                  style={[
                    styles.sheetIconBg,
                    {
                      backgroundColor:
                        opt.label === 'Remove Media'
                          ? '#FF3B3015'
                          : theme.primary + '15',
                    },
                  ]}
                >
                  <Ionicons
                    name={opt.icon}
                    size={20}
                    color={opt.label === 'Remove Media' ? '#FF3B30' : theme.primary}
                  />
                </View>
                <Text
                  style={[
                    styles.sheetRowLabel,
                    { color: opt.label === 'Remove Media' ? '#FF3B30' : theme.text },
                  ]}
                >
                  {opt.label}
                </Text>
                <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
              </Pressable>
            ))}

            <Pressable
              style={[styles.cancelBtn, { backgroundColor: theme.background }]}
              onPress={() => setSheetVisible(false)}
            >
              <Text style={[styles.cancelLabel, { color: theme.text }]}>Cancel</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  pickerArea: {
    height: 160,
    borderWidth: 1.5,
    borderRadius: 16,
    borderStyle: 'dashed',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadingContainer: {
    alignItems: 'center',
    gap: 10,
  },
  uploadingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  editOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
  },
  editOverlayText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  videoPreviewer: {
    alignItems: 'center',
    gap: 6,
  },
  videoLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  videoChange: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    gap: 8,
  },
  iconBg: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  emptyHint: {
    fontSize: 12,
  },
  // Sheet
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 34,
    paddingHorizontal: 20,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 16,
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 14,
  },
  sheetIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetRowLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  cancelBtn: {
    marginTop: 12,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});
