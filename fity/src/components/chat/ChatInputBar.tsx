import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera, X } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { SendIcon } from '../icons';
import { CameraModal } from './CameraModal';

interface Props {
  onSend?: (text: string, imageUri?: string) => void;
  placeholder?: string;
  disabled?: boolean;
  remainingMessages?: number;
}

export const ChatInputBar: React.FC<Props> = ({
  onSend,
  placeholder = 'Message Coach',
  disabled = false,
  remainingMessages,
}) => {
  const [value, setValue] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const canSend = (value.trim().length > 0 || !!imageUri) && !disabled;

  const handleSend = () => {
    if (!canSend) return;
    Haptics.selectionAsync().catch(() => {});
    onSend?.(value.trim(), imageUri ?? undefined);
    setValue('');
    setImageUri(null);
  };

  const handleImagePress = () => {
    Haptics.selectionAsync().catch(() => {});
    setCameraOpen(true);
  };

  const handleCapture = (uri: string) => {
    setImageUri(uri);
    setCameraOpen(false);
  };

  return (
    <>
      <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        {typeof remainingMessages === 'number' && remainingMessages <= 3 && (
          <Text style={styles.remaining}>
            {remainingMessages === 0
              ? 'No free messages left today'
              : `${remainingMessages} message${remainingMessages === 1 ? '' : 's'} left today`}
          </Text>
        )}
        {imageUri && (
          <View style={styles.previewRow}>
            <View style={styles.previewContainer}>
              <Image source={{ uri: imageUri }} style={styles.preview} contentFit="cover" />
              <Pressable style={styles.removeBtn} onPress={() => setImageUri(null)} hitSlop={6}>
                <X size={12} color={colors.DARK} strokeWidth={3} />
              </Pressable>
            </View>
          </View>
        )}
        <View style={styles.row}>
          <View style={styles.inputBox}>
            <TextInput
              value={value}
              onChangeText={setValue}
              placeholder={placeholder}
              placeholderTextColor={colors.MUTED}
              style={styles.input}
              editable={!disabled}
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={handleSend}
              blurOnSubmit
            />
            <Pressable hitSlop={8} style={styles.icon} onPress={handleImagePress}>
              <Camera size={20} color={colors.MUTED} />
            </Pressable>
          </View>
          <Pressable
            onPress={handleSend}
            disabled={!canSend}
            style={[styles.sendBtn, { opacity: canSend ? 1 : 0.4 }]}
            hitSlop={8}
          >
            <SendIcon size={20} color={colors.DARK} />
          </Pressable>
        </View>
      </View>
      <CameraModal
        visible={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={handleCapture}
      />
    </>
  );
};

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.DARK,
    borderTopWidth: 1,
    borderTopColor: colors.GRAY,
  },
  remaining: {
    fontSize: 12,
    color: colors.MUTED,
    textAlign: 'center',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  previewRow: {
    marginBottom: 8,
  },
  previewContainer: {
    width: 64,
    height: 64,
    borderRadius: 12,
    overflow: 'hidden',
  },
  preview: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.LIME,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.DARK3,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 6,
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.GRAY,
  },
  input: {
    flex: 1,
    color: colors.WHITE,
    fontSize: 15,
    paddingVertical: 8,
    maxHeight: 100,
  },
  icon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.LIME,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
