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
import { MetricPills } from '../../src/components/trace/MetricPills';
import { LineTrend } from '../../src/components/trace/LineTrend';
import { useProgressStore } from '../../src/store/progressStore';
import { useAuthStore } from '../../src/store/authStore';
import { trackEvent } from '../../src/services/posthog';

export default function Trace() {
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const {
    streak, bestStreak, heatmap, prs, strength, recap,
    chartData, chartUnit, chartLabel, availableMetrics, selectedMetric,
    init, fetchTrace, fetchMetrics, fetchChart, setSelectedMetric,
  } = useProgressStore();

  const isAuthenticated = !!session?.access_token;

  useEffect(() => {
    trackEvent('trace_viewed');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (isAuthenticated) {
      fetchTrace();
      fetchMetrics();
    } else {
      init();
    }
  }, [isAuthenticated]);

  // Fetch chart data when selected metric changes
  useEffect(() => {
    if (isAuthenticated && selectedMetric) {
      fetchChart(selectedMetric, '30d');
    }
  }, [isAuthenticated, selectedMetric]);

  const handleMetricSelect = (key: string) => {
    trackEvent('metric_selected', { metric_key: key });
    setSelectedMetric(key);
  };

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

        {isAuthenticated && availableMetrics.length > 0 && (
          <>
            <MetricPills
              metrics={availableMetrics}
              selected={selectedMetric}
              onSelect={handleMetricSelect}
            />
            {chartData.length > 0 && (
              <LineTrend
                points={chartData}
                unit={chartUnit}
                label={chartLabel}
              />
            )}
          </>
        )}

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
