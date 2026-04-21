import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import type { MetricItem } from '../../services/progressApi';

interface Props {
  metrics: MetricItem[];
  selected: string;
  onSelect: (key: string) => void;
}

export function MetricPills({ metrics, selected, onSelect }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Trends</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {metrics.map((m) => {
          const active = m.key === selected;
          return (
            <Pressable
              key={m.key}
              onPress={() => onSelect(m.key)}
              style={[styles.pill, active && styles.pillActive]}
            >
              <Text style={[styles.label, active && styles.labelActive]}>
                {m.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: colors.MUTED,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  row: {
    gap: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.DARK3,
    borderWidth: 1,
    borderColor: colors.GRAY,
  },
  pillActive: {
    backgroundColor: colors.LIME,
    borderColor: colors.LIME,
  },
  label: {
    color: colors.MUTED,
    fontSize: 13,
    fontWeight: '600',
  },
  labelActive: {
    color: colors.DARK,
  },
});
