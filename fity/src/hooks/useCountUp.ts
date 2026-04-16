import { useEffect, useState } from 'react';
import {
  Easing,
  cancelAnimation,
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { DURATION } from '../theme/motion';

interface Options {
  from?: number;
  to: number;
  /** Duration in ms. */
  duration?: number;
  /** Delay before starting, in ms. */
  delay?: number;
  /** If false, returns `to` immediately. */
  enabled?: boolean;
}

/**
 * Tweens a number from `from` → `to` and returns the current integer value
 * for rendering. Keeps all interpolation on the UI thread via Reanimated.
 */
export function useCountUp({
  from = 0,
  to,
  duration = DURATION.slow,
  delay = 0,
  enabled = true,
}: Options) {
  const progress = useSharedValue(from);
  const [value, setValue] = useState(enabled ? from : to);

  useEffect(() => {
    if (!enabled) {
      setValue(to);
      progress.value = to;
      return;
    }
    progress.value = from;
    const tid = setTimeout(() => {
      progress.value = withTiming(to, {
        duration,
        easing: Easing.out(Easing.cubic),
      });
    }, delay);
    return () => {
      clearTimeout(tid);
      cancelAnimation(progress);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, duration, delay, enabled]);

  useAnimatedReaction(
    () => Math.round(progress.value),
    (cur, prev) => {
      if (cur !== prev) runOnJS(setValue)(cur);
    },
  );

  return value;
}
