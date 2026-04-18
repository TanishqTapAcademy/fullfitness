import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { Easing, FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import type { BackendQuestion } from '../../services/api';
import { CoachBubble } from '../CoachBubble';
import { UserBubble } from '../UserBubble';
import { colors } from '../../theme/colors';

interface Props {
  question: BackendQuestion;
  answer: any;
  onAnswer: (answer: any) => void;
}

type Phase = number; // 0 = nothing, 1..N = intro messages, N+1 = show chips, N+2 = replied, N+3 = show plan

export const ChatSelectRenderer: React.FC<Props> = ({ question, answer, onAnswer }) => {
  const cr = question.coach_response || {};
  const introMessages: string[] = cr.intro_messages || [];
  const replyText: string = cr.reply || '';
  const options = question.options || [];

  const totalIntroPhases = introMessages.length;
  const chipsPhase = totalIntroPhases + 1;
  const repliedPhase = chipsPhase + 1;
  const planPhase = repliedPhase + 1;

  const [phase, setPhase] = useState(0);
  const [picked, setPicked] = useState<string | null>(typeof answer === 'string' ? answer : null);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 1; i <= totalIntroPhases; i++) {
      timers.push(setTimeout(() => setPhase(i), i * 1100));
    }
    timers.push(setTimeout(() => setPhase(chipsPhase), (totalIntroPhases + 1) * 1100));
    return () => timers.forEach(clearTimeout);
  }, []);

  const pickOption = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setPicked(id);
    onAnswer(id);
    setPhase(repliedPhase);
    setTimeout(() => setPhase(planPhase), 1200);
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
      <Text style={styles.title}>{question.title}</Text>
      {question.subtitle && <Text style={styles.sub}>{question.subtitle}</Text>}

      <View style={{ marginTop: 24 }}>
        {introMessages.map((msg, i) => (
          <React.Fragment key={i}>
            {phase > i && <CoachBubble text={msg} />}
            {phase === i + 1 && i < totalIntroPhases - 1 && <CoachBubble typing />}
          </React.Fragment>
        ))}

        {phase === chipsPhase && !picked && (
          <Animated.View entering={FadeInUp.duration(350)} style={styles.chips}>
            {options.map((o) => (
              <Pressable key={o.id} onPress={() => pickOption(o.id)} style={styles.chip} hitSlop={8}>
                <Text style={styles.chipText}>{o.label}</Text>
              </Pressable>
            ))}
          </Animated.View>
        )}

        {picked && phase >= repliedPhase && (
          <>
            <UserBubble text={options.find((o) => o.id === picked)?.label || ''} />
            {phase === repliedPhase && <CoachBubble typing />}
            {phase >= planPhase && replyText && (
              <>
                <CoachBubble text={replyText} />
                <Animated.View entering={FadeIn.duration(400)} style={styles.preview}>
                  <Text style={styles.previewTitle}>Your week 1</Text>
                  {[
                    { day: 'Mon', label: 'Full body strength', dur: '28 min' },
                    { day: 'Wed', label: 'Conditioning', dur: '20 min' },
                    { day: 'Fri', label: 'Lower focus', dur: '30 min' },
                    { day: 'Sun', label: 'Active recovery', dur: '15 min' },
                  ].map((d, index) => (
                    <Animated.View
                      key={d.day}
                      entering={FadeInDown.duration(260).delay(index * 70).easing(Easing.out(Easing.cubic))}
                      style={styles.row}
                    >
                      <Text style={styles.rowDay}>{d.day}</Text>
                      <Text style={styles.rowLabel}>{d.label}</Text>
                      <Text style={styles.rowDur}>{d.dur}</Text>
                    </Animated.View>
                  ))}
                </Animated.View>
              </>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  title: { color: colors.WHITE, fontSize: 28, fontWeight: '800' },
  sub: { color: colors.MUTED, fontSize: 15, marginTop: 6 },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
    marginBottom: 12,
    justifyContent: 'flex-end',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.DARK3,
    borderWidth: 1,
    borderColor: colors.GRAY,
    minHeight: 44,
    justifyContent: 'center',
  },
  chipText: { color: colors.WHITE, fontSize: 14, fontWeight: '600' },
  preview: {
    marginTop: 12,
    padding: 16,
    borderRadius: 18,
    backgroundColor: colors.DARK2,
    borderWidth: 1,
    borderColor: colors.GRAY,
    gap: 10,
  },
  previewTitle: { color: colors.LIME, fontWeight: '700', fontSize: 14, letterSpacing: 0.5 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowDay: { color: colors.MUTED, width: 40, fontWeight: '700', fontSize: 13 },
  rowLabel: { color: colors.WHITE, flex: 1, fontSize: 14 },
  rowDur: { color: colors.MUTED, fontSize: 13 },
});
