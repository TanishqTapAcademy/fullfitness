import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../../theme/colors';
import type { ChartPoint } from '../../services/progressApi';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const CHART_W = 320;
const CHART_H = 140;
const PAD_X = 32;
const PAD_Y = 16;

interface Props {
  points: ChartPoint[];
  unit: string;
  label: string;
}

export function LineTrend({ points, unit, label }: Props) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, { duration: 800 });
  }, [points]);

  if (points.length < 2) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.empty}>Not enough data yet.</Text>
      </View>
    );
  }

  const values = points.map((p) => p.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  const plotW = CHART_W - PAD_X * 2;
  const plotH = CHART_H - PAD_Y * 2;

  const coords = points.map((p, i) => ({
    x: PAD_X + (i / (points.length - 1)) * plotW,
    y: PAD_Y + plotH - ((p.value - minVal) / range) * plotH,
  }));

  // Build bezier path
  let d = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 1; i < coords.length; i++) {
    const prev = coords[i - 1];
    const curr = coords[i];
    const cpx1 = prev.x + (curr.x - prev.x) * 0.4;
    const cpx2 = curr.x - (curr.x - prev.x) * 0.4;
    d += ` C ${cpx1} ${prev.y} ${cpx2} ${curr.y} ${curr.x} ${curr.y}`;
  }

  // Calculate total path length (approximate)
  const totalLen = coords.reduce((acc, c, i) => {
    if (i === 0) return 0;
    const dx = c.x - coords[i - 1].x;
    const dy = c.y - coords[i - 1].y;
    return acc + Math.sqrt(dx * dx + dy * dy);
  }, 0);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: totalLen * (1 - progress.value),
  }));

  // Axis labels
  const lastPoint = points[points.length - 1];
  const firstDate = points[0].date.slice(5); // MM-DD
  const lastDate = lastPoint.date.slice(5);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.latest}>
          {lastPoint.value} {unit}
        </Text>
      </View>
      <Svg width={CHART_W} height={CHART_H} style={styles.svg}>
        {/* Grid lines */}
        <Line
          x1={PAD_X} y1={PAD_Y}
          x2={PAD_X} y2={CHART_H - PAD_Y}
          stroke={colors.GRAY} strokeWidth={0.5}
        />
        <Line
          x1={PAD_X} y1={CHART_H - PAD_Y}
          x2={CHART_W - PAD_X} y2={CHART_H - PAD_Y}
          stroke={colors.GRAY} strokeWidth={0.5}
        />

        {/* Axis labels */}
        <SvgText x={PAD_X} y={CHART_H - 2} fill={colors.MUTED} fontSize={9}>
          {firstDate}
        </SvgText>
        <SvgText
          x={CHART_W - PAD_X} y={CHART_H - 2}
          fill={colors.MUTED} fontSize={9} textAnchor="end"
        >
          {lastDate}
        </SvgText>
        <SvgText x={2} y={PAD_Y + 4} fill={colors.MUTED} fontSize={9}>
          {maxVal}
        </SvgText>
        <SvgText x={2} y={CHART_H - PAD_Y} fill={colors.MUTED} fontSize={9}>
          {minVal}
        </SvgText>

        {/* Animated line */}
        <AnimatedPath
          d={d}
          fill="none"
          stroke={colors.LIME}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeDasharray={totalLen}
          animatedProps={animatedProps}
        />

        {/* End dot */}
        <Circle
          cx={coords[coords.length - 1].x}
          cy={coords[coords.length - 1].y}
          r={4}
          fill={colors.LIME}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: colors.DARK2,
    borderRadius: 16,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    color: colors.WHITE,
    fontSize: 14,
    fontWeight: '600',
  },
  latest: {
    color: colors.LIME,
    fontSize: 14,
    fontWeight: '700',
  },
  svg: {
    alignSelf: 'center',
  },
  empty: {
    color: colors.MUTED,
    fontSize: 13,
    marginTop: 8,
  },
});
