import React, { useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, SwitchCamera, Images } from 'lucide-react-native';
import { colors } from '../../theme/colors';

const getImagePicker = () => require('expo-image-picker') as typeof import('expo-image-picker');

interface Props {
  visible: boolean;
  onClose: () => void;
  onCapture: (uri: string) => void;
}

export const CameraModal: React.FC<Props> = ({ visible, onClose, onCapture }) => {
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const [preview, setPreview] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();

  React.useEffect(() => {
    if (visible && !permission?.granted) {
      requestPermission();
    }
    if (!visible) {
      setPreview(null);
    }
  }, [visible]);

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
    if (photo?.uri) {
      setPreview(photo.uri);
    }
  };

  const handleGallery = async () => {
    try {
      const ImagePicker = getImagePicker();
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') return;
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.7,
      });
      if (!result.canceled && result.assets?.[0]) {
        setPreview(result.assets[0].uri);
      }
    } catch {}
  };

  const handleConfirm = () => {
    if (preview) {
      onCapture(preview);
      setPreview(null);
    }
  };

  const handleRetake = () => {
    setPreview(null);
  };

  if (!permission?.granted) return null;

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent>
      <View style={styles.container}>
        {preview ? (
          // Preview mode — show captured/selected image
          <>
            <Image source={{ uri: preview }} style={StyleSheet.absoluteFill} contentFit="contain" />
            <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
              <Pressable style={styles.iconBtn} onPress={handleRetake} hitSlop={12}>
                <X size={24} color="#fff" />
              </Pressable>
            </View>
            <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
              <View style={styles.bottomCenter}>
                <Pressable style={styles.confirmBtn} onPress={handleConfirm}>
                  <View style={styles.confirmInner} />
                </Pressable>
              </View>
            </View>
          </>
        ) : (
          // Camera mode
          <>
            <CameraView
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              facing={facing}
            />
            <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
              <Pressable style={styles.iconBtn} onPress={onClose} hitSlop={12}>
                <X size={24} color="#fff" />
              </Pressable>
              <Pressable
                style={styles.iconBtn}
                onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))}
                hitSlop={12}
              >
                <SwitchCamera size={24} color="#fff" />
              </Pressable>
            </View>
            <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
              <Pressable style={styles.galleryBtn} onPress={handleGallery} hitSlop={12}>
                <Images size={28} color="#fff" />
              </Pressable>
              <Pressable style={styles.captureBtn} onPress={handleCapture}>
                <View style={styles.captureInner} />
              </Pressable>
              <View style={styles.spacer} />
            </View>
          </>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
  },
  bottomCenter: {
    flex: 1,
    alignItems: 'center',
  },
  galleryBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spacer: {
    width: 48,
  },
  captureBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#fff',
  },
  confirmBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: colors.LIME,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.LIME,
  },
});
