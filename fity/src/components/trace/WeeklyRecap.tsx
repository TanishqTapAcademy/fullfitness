import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors } from '../../theme/colors';
import { DURATION, STAGGER } from '../../theme/motion';
import { useViewportTrigger } from '../../hooks/useViewportTrigger';

interface Props {
  recap: string;
  chips?: string[];
}

/** Word-by-word reveal. Fires once when the recap lands in the viewport. */
export const WeeklyRecap: React.FC<Props> = ({
  recap,
  chips = ['Showed up', 'Moved well', 'Set the pace'],
}) => {
  const { triggered, onLayout } = useViewportTrigger();
  const words = useMemo(() => recap.split(/\s+/), [recap]);

  return (
    <View onLayout={onLayout} style={styles.wrap}>
      <Text style={styles.label}>This week</Text>
      <View style={styles.words}>
        {words.map((w, i) => (
          <Animated.Text
            key={`${w}-${i}`}
            entering={triggered ? FadeIn.duration(DURATION.base).delay(i * STAGGER.tight) : undefined}
            style={styles.word}
          >
            {w}{' '}
          </Animated.Text>
        ))}
      </View>
      <View style={styles.chipsRow}>
        {chips.map((c, i) => (
          <Animated.View
            key={c}
            entering={triggered ? FadeIn.duration(DURATION.base).delay(words.length * STAGGER.tight + i * STAGGER.normal) : undefined}
            style={styles.chip}
          >
            <Text style={styles.chipText}>{c}</Text>
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 20,
    marginTop: 22,
    marginBottom: 32,
    padding: 18,
    borderRadius: 20,
    backgroundColor: colors.DARK2,
    borderLeftWidth: 3,
    borderLeftColor: colors.LIME,
    borderWidth: 1,
    borderColor: colors.GRAY,
  },
  label: {
    color: colors.LIME,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  words: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  word: {
    color: colors.WHITE,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: colors.DARK3,
    borderWidth: 1,
    borderColor: colors.GRAY,
  },
  chipText: { color: colors.LIME, fontSize: 12, fontWeight: '700' },
});
