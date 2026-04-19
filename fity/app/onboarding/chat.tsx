import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInUp, Easing } from 'react-native-reanimated';
import { CoachBubble } from '../../src/components/CoachBubble';
import { UserBubble } from '../../src/components/UserBubble';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { useOnboardingStore } from '../../src/store/onboardingStore';
import { colors } from '../../src/theme/colors';

const QUIT_OPTIONS = [
  { label: 'Got bored', resp: "I'll rotate programming every 3 weeks so it never gets stale." },
  { label: 'Life got busy', resp: "I'll design sessions that flex around your schedule — even 20 min counts." },
  { label: 'Got injured', resp: "I'll program with safety margins and auto-adjust when something feels off." },
  { label: 'No real plan', resp: "That's what I'm here for. Every session, mapped out." },
];

const WEEK1_PLAN = [
  { day: 'Mon', label: 'Upper Push', duration: '35 min' },
  { day: 'Tue', label: 'Active Recovery', duration: '15 min' },
  { day: 'Wed', label: 'Lower Body', duration: '40 min' },
  { day: 'Thu', label: 'Rest', duration: '—' },
  { day: 'Fri', label: 'Upper Pull', duration: '35 min' },
  { day: 'Sat', label: 'Conditioning', duration: '25 min' },
  { day: 'Sun', label: 'Rest', duration: '—' },
];

type Phase = 'intro' | 'asking' | 'replied' | 'plan';

export default function CoachChat() {
  const router = useRouter();
  const { answers, questions } = useOnboardingStore();
  const scrollRef = useRef<ScrollView>(null);
  const [phase, setPhase] = useState<Phase>('intro');
  const [typing, setTyping] = useState(true);
  const [messages, setMessages] = useState<string[]>([]);
  const [selectedQuit, setSelectedQuit] = useState<typeof QUIT_OPTIONS[0] | null>(null);

  // Build summary from answers
  const goalQ = questions.find(q => q.step_id === 'goals');
  const goalAnswer = goalQ ? answers[goalQ.step_id] : null;
  const goalLabels = Array.isArray(goalAnswer) && goalQ?.options
    ? goalAnswer.map((id: string) => {
        const opt = (goalQ.options as any[]).find((o: any) => o.id === id);
        return opt?.label || id;
      }).join(', ')
    : 'your goals';

  const equipQ = questions.find(q => q.step_id === 'equipment');
  const equipAnswer = equipQ ? answers[equipQ.step_id] : null;
  const equipLabel = equipQ?.options
    ? ((equipQ.options as any[]).find((o: any) => o.id === equipAnswer)?.label || 'your setup')
    : 'your setup';

  // Phased message flow
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Phase: intro — show typing, then first message, then second, then ask
    setTyping(true);
    timers.push(setTimeout(() => {
      setTyping(false);
      setMessages([`Got it — ${goalLabels} with ${equipLabel.toLowerCase()}. I can work with that.`]);
    }, 1500));

    timers.push(setTimeout(() => {
      setMessages(prev => [...prev, "Before I build your plan, one quick question..."]);
    }, 3000));

    timers.push(setTimeout(() => {
      setMessages(prev => [...prev, "What's the one thing that's made you quit training before?"]);
      setPhase('asking');
    }, 4500));

    return () => timers.forEach(clearTimeout);
  }, []);

  const handleQuit = (option: typeof QUIT_OPTIONS[0]) => {
    setSelectedQuit(option);
    setPhase('replied');

    // Show coach response after a beat, then plan
    setTimeout(() => {
      setPhase('plan');
    }, 2000);
  };

  const handleSavePlan = () => {
    router.push('/onboarding/auth');
  };

  // Auto-scroll on new content
  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, phase, selectedQuit]);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Typing indicator */}
        {typing && <CoachBubble typing />}

        {/* Coach messages */}
        {messages.map((msg, i) => (
          <CoachBubble key={i} text={msg} />
        ))}

        {/* Quit reason chips */}
        {phase === 'asking' && !selectedQuit && (
          <Animated.View entering={FadeIn.duration(300).delay(200)} style={styles.chips}>
            {QUIT_OPTIONS.map((opt) => (
              <Pressable
                key={opt.label}
                style={styles.chip}
                onPress={() => handleQuit(opt)}
              >
                <Text style={styles.chipText}>{opt.label}</Text>
              </Pressable>
            ))}
          </Animated.View>
        )}

        {/* User selection + coach response */}
        {selectedQuit && (
          <>
            <UserBubble text={selectedQuit.label} />
            {phase === 'plan' ? (
              <CoachBubble text={selectedQuit.resp} />
            ) : (
              <CoachBubble typing />
            )}
          </>
        )}

        {/* Week 1 preview */}
        {phase === 'plan' && (
          <Animated.View entering={FadeInUp.duration(400).delay(300).easing(Easing.out(Easing.cubic))}>
            <CoachBubble text="Here's your Week 1 preview:" />
            <View style={styles.planCard}>
              <Text style={styles.planTitle}>Week 1</Text>
              {WEEK1_PLAN.map((d) => (
                <View key={d.day} style={styles.planRow}>
                  <Text style={styles.planDay}>{d.day}</Text>
                  <Text style={styles.planLabel}>{d.label}</Text>
                  <Text style={styles.planDuration}>{d.duration}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}
      </ScrollView>

      {/* Save button */}
      {phase === 'plan' && (
        <Animated.View entering={FadeIn.duration(300).delay(500)} style={styles.footer}>
          <PrimaryButton label="Save my plan" onPress={handleSavePlan} />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.DARK,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
    marginTop: 4,
  },
  chip: {
    backgroundColor: colors.DARK3,
    borderWidth: 1,
    borderColor: colors.GRAY2,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  chipText: {
    color: colors.WHITE,
    fontSize: 14,
    fontWeight: '500',
  },
  planCard: {
    backgroundColor: colors.DARK3,
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    marginBottom: 12,
    marginLeft: 46,
  },
  planTitle: {
    color: colors.LIME,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  planDay: {
    color: colors.MUTED,
    fontSize: 13,
    width: 40,
    fontWeight: '600',
  },
  planLabel: {
    color: colors.WHITE,
    fontSize: 14,
    flex: 1,
  },
  planDuration: {
    color: colors.MUTED,
    fontSize: 13,
  },
  footer: {
    padding: 20,
    paddingBottom: 36,
  },
});
