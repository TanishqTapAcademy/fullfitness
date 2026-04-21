import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors } from '../../theme/colors';
import { DURATION, EASING_OUT_CUBIC } from '../../theme/motion';
import type { TodayLog } from '../../services/progressApi';

const DOMAIN_COLORS: Record<string, string> = {
  exercise: colors.LIME,
  nutrition: '#6BF0FF',
  lifestyle: '#FF9F6B',
};

interface Props {
  logs: TodayLog[];
  delay?: number;
}

export function RecentLogsCard({ logs, delay = 0 }: Props) {
  if (logs.length === 0) return null;

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(DURATION.base).easing(EASING_OUT_CUBIC)}
      style={styles.container}
    >
      <Text style={styles.title}>Today's log</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillRow}
      >
        {logs.map((log) => {
          const accent = DOMAIN_COLORS[log.domain] || colors.MUTED;
          return (
            <View key={log.id} style={[styles.pill, { borderColor: accent }]}>
              <View style={[styles.dot, { backgroundColor: accent }]} />
              <Text style={styles.pillText} numberOfLines={1}>
                {log.label}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 16,
  },
  title: {
    color: colors.MUTED,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  pillRow: {
    gap: 8,
    paddingRight: 20,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: colors.DARK2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pillText: {
    color: colors.WHITE,
    fontSize: 13,
    fontWeight: '500',
    maxWidth: 160,
  },
});
