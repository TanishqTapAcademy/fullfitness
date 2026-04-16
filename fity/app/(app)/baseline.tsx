import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors } from '../../src/theme/colors';
import { BaselineHeader } from '../../src/components/baseline/BaselineHeader';
import { BaselineTestCard } from '../../src/components/baseline/BaselineTestCard';
import { BaselineCelebration } from '../../src/components/baseline/BaselineCelebration';
import { BASELINE_TESTS } from '../../src/data/baselineTests';
import { useBaselineStore } from '../../src/store/baselineStore';
import { useProgressStore } from '../../src/store/progressStore';
import { useChatStore } from '../../src/store/chatStore';
import { POST_BASELINE_MESSAGE } from '../../src/data/chatScripts';

/**
 * Baseline modal sheet. 4 sequential tests → celebration → auto-navigates
 * back to Home. Uses the store so reopening the modal would resume state,
 * though v1 resets on dismiss from Home.
 */
export default function Baseline() {
  const router = useRouter();
  const { index, setResult, next, finish, reset } = useBaselineStore();
  const { init, bumpStreak } = useProgressStore();
  const { push } = useChatStore();
  const [showCelebration, setShowCelebration] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    reset();
    setShowCelebration(false);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [reset]);

  const test = BASELINE_TESTS[index];

  const handleAnswer = (r: 'good' | 'ok' | 'flag') => {
    setResult(test.id, r);
    if (index === BASELINE_TESTS.length - 1) {
      finish();
      // Seed progress & bump the first day-streak as the baseline closes.
      init();
      bumpStreak();
      push({
        id: `c-post-baseline-${Date.now()}`,
        from: 'coach',
        text: POST_BASELINE_MESSAGE,
      });
      setShowCelebration(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      timerRef.current = setTimeout(() => {
        router.replace('/(app)/home');
      }, 1400);
    } else {
      next();
    }
  };

  const handleClose = () => {
    Haptics.selectionAsync().catch(() => {});
    router.back();
  };

  return (
    <View style={styles.root}>
      <BaselineHeader
        onClose={handleClose}
        total={BASELINE_TESTS.length}
        current={showCelebration ? BASELINE_TESTS.length - 1 : index}
      />
      <View style={styles.body}>
        {showCelebration ? (
          <BaselineCelebration />
        ) : (
          <BaselineTestCard
            test={test}
            index={index}
            total={BASELINE_TESTS.length}
            onAnswer={handleAnswer}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.DARK,
  },
  body: {
    flex: 1,
    paddingTop: 10,
  },
});
