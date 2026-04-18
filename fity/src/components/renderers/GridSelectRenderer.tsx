import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { BackendQuestion } from '../../services/api';
import { GridCard } from '../GridCard';
import { CoachReply } from '../CoachReply';
import { getIcon } from '../icons/registry';
import { colors } from '../../theme/colors';

interface Props {
  question: BackendQuestion;
  answer: any;
  onAnswer: (answer: any) => void;
}

export const GridSelectRenderer: React.FC<Props> = ({ question, answer, onAnswer }) => {
  const selected: string | null = typeof answer === 'string' ? answer : null;
  const options = question.options || [];
  const columns = question.config?.columns || 2;

  const coachText = selected ? resolveCoachResponse(question, selected) : null;

  // Split options into rows of `columns`
  const rows: typeof options[] = [];
  for (let i = 0; i < options.length; i += columns) {
    rows.push(options.slice(i, i + columns));
  }

  return (
    <>
      <Text style={styles.title}>{question.title}</Text>
      {question.subtitle && <Text style={styles.sub}>{question.subtitle}</Text>}
      <View style={styles.grid}>
        {rows.map((row, ri) => (
          <View key={ri} style={styles.row}>
            {row.map((opt) => {
              const IconComp = opt.icon ? getIcon(opt.icon) : null;
              return (
                <GridCard
                  key={opt.id}
                  icon={IconComp ? <IconComp size={24} color={colors.LIME} /> : <View />}
                  label={opt.label}
                  desc={opt.desc || ''}
                  selected={selected === opt.id}
                  onPress={() => onAnswer(opt.id)}
                />
              );
            })}
          </View>
        ))}
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
  grid: { marginTop: 20, gap: 12 },
  row: { flexDirection: 'row', gap: 12 },
});
