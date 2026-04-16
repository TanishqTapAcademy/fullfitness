import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeInDown,
  FadeOut,
  SlideInRight,
  ZoomIn,
} from 'react-native-reanimated';
import { colors } from '../../theme/colors';
import { DURATION, EASING_OUT_CUBIC } from '../../theme/motion';
import type { BaselineTest, BaselineResult } from '../../data/baselineTests';
import { MoveIllustration } from './MoveIllustration';
import { useSelectionPulse } from '../../hooks/useSelectionPulse';

interface Props {
  test: BaselineTest;
  index: number;
  total: number;
  onAnswer: (r: BaselineResult) => void;
}

const CHOICES: { id: BaselineResult; label: string; hint: string }[] = [
  { id: 'good', label: 'Felt strong', hint: 'Clean reps, no strain' },
  { id: 'ok', label: 'Got through', hint: 'A little shaky' },
  { id: 'flag', label: 'Struggled', hint: "We'll scale this down" },
];

/**
 * A single movement test card. Slides in from the right via Reanimated's
 * entering animation; outgoing cards fade out as the parent swaps its key.
 */
export const BaselineTestCard: React.FC<Props> = ({ test, index, total, onAnswer }) => {
  const { pulse, animatedStyle } = useSelectionPulse();

  const pick = (r: BaselineResult) => {
    Haptics.selectionAsync().catch(() => {});
    pulse();
    // Give the pulse a beat before announcing the result to the parent.
    setTimeout(() => onAnswer(r), 120);
  };

  return (
    <Animated.View
      key={test.id}
      entering={SlideInRight.duration(DURATION.base).easing(EASING_OUT_CUBIC)}
      exiting={FadeOut.duration(DURATION.fast)}
      style={styles.card}
    >
      <Animated.View entering={ZoomIn.duration(DURATION.base).easing(EASING_OUT_CUBIC)} style={styles.illu}>
        <MoveIllustration kind={test.illustration} size={160} />
      </Animated.View>
      <Animated.Text entering={FadeInDown.delay(80).duration(DURATION.base)} style={styles.stepLabel}>
        Test {index + 1} of {total}
      </Animated.Text>
      <Animated.Text entering={FadeInDown.delay(120).duration(DURATION.base)} style={styles.title}>
        {test.title}
      </Animated.Text>
      <Animated.Text entering={FadeInDown.delay(160).duration(DURATION.base)} style={styles.hint}>
        {test.hint}
      </Animated.Text>
      <Animated.Text entering={FadeInDown.delay(200).duration(DURATION.base)} style={styles.cue}>
        {test.cue}
      </Animated.Text>

      <Animated.View entering={FadeInDown.delay(260).duration(DURATION.base)} style={[styles.chips, animatedStyle]}>
        {CHOICES.map((c) => (
          <Pressable key={c.id} onPress={() => pick(c.id)} style={styles.chip} hitSlop={6}>
            <Text style={styles.chipLabel}>{c.label}</Text>
            <Text style={styles.chipHint}>{c.hint}</Text>
          </Pressable>
        ))}
      </Animated.View>

      <View style={{ flex: 1 }} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    alignItems: 'center',
  },
  illu: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.DARK2,
    borderWidth: 1,
    borderColor: colors.GRAY,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  stepLabel: {
    color: colors.LIME,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.WHITE,
    fontSize: 24,
    fontWeight: '800',
    marginTop: 6,
    textAlign: 'center',
  },
  hint: {
    color: colors.MUTED,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 300,
    lineHeight: 20,
  },
  cue: {
    color: colors.WHITE,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
  },
  chips: {
    marginTop: 22,
    gap: 8,
    width: '100%',
  },
  chip: {
    backgroundColor: colors.DARK2,
    borderWidth: 1,
    borderColor: colors.GRAY,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
  },
  chipLabel: { color: colors.WHITE, fontSize: 15, fontWeight: '700' },
  chipHint: { color: colors.MUTED, fontSize: 12, marginTop: 2 },
});
