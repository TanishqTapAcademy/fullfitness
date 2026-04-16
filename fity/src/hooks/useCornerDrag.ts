import { Gesture } from 'react-native-gesture-handler';
import {
  runOnJS,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { DURATION, SPRING_SOFT } from '../theme/motion';

interface Options {
  /** Pixels of diagonal pull required to fully activate (progress = 1). */
  pullDistance?: number;
  /** Progress threshold above which release triggers `onOpen`. 0–1. */
  threshold?: number;
  /** Called on the JS thread if the user releases past the threshold. */
  onOpen: () => void;
  /** Optional haptic tick. Called once as the gesture starts. */
  onPullStart?: () => void;
}

/**
 * Encapsulates a diagonal pull gesture from the bottom-right corner.
 * Returns a shared `progress` value (0–1) plus a `Gesture` to attach to a
 * `GestureDetector`.
 */
export function useCornerDrag({
  pullDistance = 160,
  threshold = 0.45,
  onOpen,
  onPullStart,
}: Options) {
  const progress = useSharedValue(0);
  const active = useSharedValue(0);

  const gesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .activeOffsetY([-10, 10])
    .onBegin(() => {
      active.value = 1;
      if (onPullStart) runOnJS(onPullStart)();
    })
    .onUpdate((e) => {
      // Pull up-left from the bottom-right corner: dx < 0, dy < 0.
      const dx = Math.max(0, -e.translationX);
      const dy = Math.max(0, -e.translationY);
      // Use euclidean distance so diagonal pull is what counts.
      const dist = Math.sqrt(dx * dx + dy * dy);
      progress.value = Math.min(1, dist / pullDistance);
    })
    .onEnd(() => {
      active.value = 0;
      if (progress.value >= threshold) {
        progress.value = withTiming(1, { duration: DURATION.fast });
        runOnJS(onOpen)();
        // Snap back after transition so the next entry is clean.
        progress.value = withTiming(0, { duration: DURATION.base });
      } else {
        progress.value = withSpring(0, SPRING_SOFT);
      }
    })
    .onFinalize(() => {
      active.value = 0;
    });

  return { gesture, progress, active };
}
