import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors } from '../theme/colors';
import { CheckIcon } from './icons';
import { useOnboardingStore } from '../store/onboardingStore';
import { equipData, levelData } from '../data/onboarding';

const equipShort: Record<string, string> = {
  full_gym: 'Gym',
  home: 'Home',
  bodyweight: 'Bodyweight',
  not_sure: 'Flexible',
};

const levelShort: Record<string, string> = {
  beginner: 'Beginner',
  some: 'Some exp.',
  consistent: 'Consistent',
  advanced: 'Advanced',
};

const Chip: React.FC<{ label: string }> = ({ label }) => (
  <Animated.View entering={FadeIn.duration(240)} style={styles.chip}>
    <CheckIcon size={10} color={colors.LIME} />
    <Text style={styles.text}>{label}</Text>
  </Animated.View>
);

export const CommitmentChips: React.FC = () => {
  const { goals, equip, level } = useOnboardingStore();

  const items: { key: string; label: string }[] = [];
  if (goals.length > 0) items.push({ key: 'goals', label: 'Goals' });
  if (equip) {
    const e = equipData.find((x) => x.id === equip);
    items.push({ key: 'equip', label: equipShort[equip] ?? e?.label ?? 'Equipment' });
  }
  if (level) {
    const l = levelData.find((x) => x.id === level);
    items.push({ key: 'level', label: levelShort[level] ?? l?.label ?? 'Level' });
  }

  if (items.length === 0) return null;

  return (
    <View style={styles.row}>
      {items.map((i) => (
        <Chip key={i.key} label={i.label} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.DARK3,
  },
  text: {
    color: colors.LIME,
    fontSize: 11,
    fontWeight: '600',
  },
});
