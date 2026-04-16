import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Polyline } from 'react-native-svg';
import { colors } from '../theme/colors';

interface Props {
  onPress?: () => void;
}

export const BackButton: React.FC<Props> = ({ onPress }) => {
  const router = useRouter();
  const handle = () => {
    if (onPress) onPress();
    else if (router.canGoBack()) router.back();
  };
  return (
    <Pressable onPress={handle} style={styles.btn} hitSlop={12}>
      <View style={styles.inner}>
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
          <Polyline
            points="15,5 8,12 15,19"
            stroke={colors.WHITE}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </Svg>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  btn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.DARK3,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
