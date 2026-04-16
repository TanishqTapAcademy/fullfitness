import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors } from '../../src/theme/colors';
import { TraceHeader } from '../../src/components/trace/TraceHeader';
import { StreakHero } from '../../src/components/trace/StreakHero';
import { Heatmap } from '../../src/components/trace/Heatmap';
import { PRWall } from '../../src/components/trace/PRWall';
import { StrengthCurve } from '../../src/components/trace/StrengthCurve';
import { WeeklyRecap } from '../../src/components/trace/WeeklyRecap';
import { useProgressStore } from '../../src/store/progressStore';

/**
 * Trace — the "hidden" progress layer reachable only via the corner-pull
 * gesture from Chat. Presented as a transparentModal so the Chat layer
 * remains visible underneath during transitions.
 */
export default function Trace() {
  const router = useRouter();
  const { streak, bestStreak, heatmap, prs, strength, recap, init } = useProgressStore();

  useEffect(() => {
    init();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, [init]);

  return (
    <View style={styles.root}>
      <TraceHeader onBack={() => router.back()} dayCount={streak} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        <StreakHero streak={streak} bestStreak={bestStreak} />
        <Heatmap cells={heatmap} />
        <PRWall prs={prs} />
        <StrengthCurve data={strength} />
        <WeeklyRecap recap={recap} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.DARK,
  },
});
