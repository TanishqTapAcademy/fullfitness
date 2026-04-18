import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { BackendQuestion } from '../../services/api';
import { OptionCard } from '../OptionCard';
import { CoachReply } from '../CoachReply';
import { getIcon } from '../icons/registry';
import { colors } from '../../theme/colors';

interface Props {
  question: BackendQuestion;
  answer: any;
  onAnswer: (answer: any) => void;
}

export const SingleSelectRenderer: React.FC<Props> = ({ question, answer, onAnswer }) => {
  const selected: string | null = typeof answer === 'string' ? answer : null;
  const coachText = selected ? resolveCoachResponse(question, selected) : null;

  return (
    <>
      <Text style={styles.title}>{question.title}</Text>
      {question.subtitle && <Text style={styles.sub}>{question.subtitle}</Text>}
      <View style={{ gap: 10, marginTop: 20 }}>
        {(question.options || []).map((opt) => {
          const IconComp = opt.icon ? getIcon(opt.icon) : null;
          return (
            <OptionCard
              key={opt.id}
              icon={IconComp ? <IconComp size={22} color={colors.LIME} /> : undefined}
              label={opt.label}
              desc={opt.desc}
              selected={selected === opt.id}
              onPress={() => onAnswer(opt.id)}
            />
          );
        })}
      </View>
      {coachText && <CoachReply text={coachText} />}
    </>
  );
};

function resolveCoachResponse(question: BackendQuestion, selected: string): string | null {
  const cr = question.coach_response;
  if (!cr) return null;
  if (cr[selected]) return cr[selected];
  if (cr.default) return cr.default;
  return null;
}

const styles = StyleSheet.create({
  title: { color: colors.WHITE, fontSize: 28, fontWeight: '800' },
  sub: { color: colors.MUTED, fontSize: 15, marginTop: 6 },
});
