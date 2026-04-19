import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, Easing } from 'react-native-reanimated';
import { ScreenShell } from '../../src/components/ScreenShell';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { QuestionRenderer } from '../../src/components/renderers/QuestionRenderer';
import { useOnboardingStore } from '../../src/store/onboardingStore';
import { colors } from '../../src/theme/colors';

export default function DynamicQuestions() {
  const router = useRouter();
  const {
    questions, currentIndex, answers, loading,
    setAnswer, nextQuestion,
  } = useOnboardingStore();

  // Questions are prefetched on the welcome screen
  if (loading || questions.length === 0) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.LIME} />
      </View>
    );
  }

  const question = questions[currentIndex];
  const isLast = currentIndex >= questions.length - 1;

  // Compute directly so React tracks the dependency
  const currentAnswer = question ? answers[question.step_id] : undefined;
  const canContinue =
    currentAnswer !== undefined &&
    currentAnswer !== null &&
    !(Array.isArray(currentAnswer) && currentAnswer.length === 0);

  if (!question) {
    // All questions done
    router.replace('/onboarding/chat');
    return null;
  }

  const handleContinue = () => {
    if (isLast) {
      router.push('/onboarding/chat');
    } else {
      nextQuestion();
    }
  };

  const handleAnswer = (answer: any) => {
    setAnswer(question.step_id, question.id, answer);
  };

  // Step number: offset by 1 because welcome is step 0
  const stepNumber = currentIndex + 1;

  return (
    <ScreenShell
      step={stepNumber}
      scroll={question.type !== 'wheel'}
      footer={
        <PrimaryButton
          label={isLast ? 'Continue' : 'Continue'}
          disabled={!canContinue}
          onPress={handleContinue}
        />
      }
    >
      <Animated.View
        key={question.id}
        entering={FadeIn.duration(280).easing(Easing.out(Easing.cubic))}
        style={{ flex: question.type === 'wheel' ? 1 : undefined }}
      >
        <QuestionRenderer
          question={question}
          answer={answers[question.step_id]}
          onAnswer={handleAnswer}
          allAnswers={answers}
        />
      </Animated.View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.DARK,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
