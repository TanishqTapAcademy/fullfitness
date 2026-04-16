import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../../theme/colors';
import { DURATION, EASING_OUT_CUBIC, STAGGER } from '../../theme/motion';
import { useViewportTrigger } from '../../hooks/useViewportTrigger';

interface Props {
  /** 12 values; the height of each bar is scaled to the max. */
  data: number[];
}

const MAX_BAR_HEIGHT = 90;

const Bar: React.FC<{ value: number; max: number; index: number; enabled: boolean }> = ({
  value,
  max,
  index,
  enabled,
}) => {
  const target = (value / max) * MAX_BAR_HEIGHT;
  const h = useSharedValue(0);

  useEffect(() => {
    if (!enabled) return;
    h.value = withDelay(
      index * STAGGER.tight,
      withTiming(target, { duration: DURATION.slow, easing: EASING_OUT_CUBIC }),
    );
  }, [enabled, h, index, target]);

  const s = useAnimatedStyle(() => ({ height: h.value }));

  return (
    <View style={styles.barSlot}>
      <Animated.View style={[styles.bar, s]} />
    </View>
  );
};

/** 12 vertical bars representing strength trend over the last 12 weeks. */
export const StrengthCurve: React.FC<Props> = ({ data }) => {
  const { triggered, onLayout } = useViewportTrigger();
  const max = Math.max(1, ...data);
  return (
    <View onLayout={onLayout} style={styles.wrap}>
      <Text style={styles.label}>Strength trend</Text>
      <View style={styles.row}>
        {data.map((v, i) => (
          <Bar key={i} value={v} max={max} index={i} enabled={triggered} />
        ))}
      </View>
      <View style={styles.axisRow}>
        <Text style={styles.axis}>12w ago</Text>
        <Text style={styles.axis}>Now</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 20,
    marginTop: 22,
    padding: 16,
    borderRadius: 20,
    backgroundColor: colors.DARK2,
    borderWidth: 1,
    borderColor: colors.GRAY,
  },
  label: {
    color: colors.MUTED,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    height: MAX_BAR_HEIGHT,
  },
  barSlot: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    backgroundColor: colors.LIME,
    borderRadius: 4,
    minHeight: 2,
  },
  axisRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  axis: { color: colors.MUTED, fontSize: 11, fontWeight: '600' },
});
