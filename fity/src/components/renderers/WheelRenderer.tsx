import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { BackendQuestion } from '../../services/api';
import { Wheel } from '../Wheel';
import { colors } from '../../theme/colors';

interface Props {
  question: BackendQuestion;
  answer: any;
  onAnswer: (answer: any) => void;
}

export const WheelRenderer: React.FC<Props> = ({ question, answer, onAnswer }) => {
  const config = question.config || {};
  const min = config.min ?? 0;
  const max = config.max ?? 200;
  const defaultVal = config.default ?? Math.round((min + max) / 2);
  const suffix = config.suffix ?? '';

  const value = typeof answer === 'number' ? answer : defaultVal;

  // Set default on mount if no answer
  useEffect(() => {
    if (answer === undefined || answer === null) {
      onAnswer(defaultVal);
    }
  }, []);

  return (
    <>
      <Text style={styles.title}>{question.title}</Text>
      {question.subtitle && <Text style={styles.sub}>{question.subtitle}</Text>}
      <View style={styles.wheelWrap}>
        <Wheel
          min={min}
          max={max}
          value={value}
          onChange={onAnswer}
          suffix={suffix}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  title: { color: colors.WHITE, fontSize: 28, fontWeight: '800' },
  sub: { color: colors.MUTED, fontSize: 15, marginTop: 6 },
  wheelWrap: { flex: 1, justifyContent: 'center', marginTop: 20 },
});
