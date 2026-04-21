import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { colors } from '../../theme/colors';
import { CoachAvatarIcon } from '../icons';
import { TypingIndicator } from './TypingIndicator';
import { DURATION, EASING_OUT_CUBIC } from '../../theme/motion';

interface Props {
  from: 'coach' | 'user';
  text?: string;
  typing?: boolean;
  /** When true, the avatar is hidden (e.g. for consecutive coach messages). */
  compact?: boolean;
  /** When true, text reveals character-by-character on mount. */
  typewriter?: boolean;
  /** When true, skip the enter animation (used for streaming messages). */
  skipEnterAnimation?: boolean;
}

/**
 * A single chat bubble. Renders either the coach variant (with avatar + dark
 * background) or the user variant (lime, right-aligned). Typing state shows
 * the shared TypingIndicator instead of text.
 */
export const MessageBubble: React.FC<Props> = ({ from, text, typing, compact, typewriter, skipEnterAnimation }) => {
  const isCoach = from === 'coach';
  const rendered = text;

  const bubbleBody = typing ? (
    <TypingIndicator />
  ) : (
    <Text style={isCoach ? styles.coachText : styles.userText}>{rendered}</Text>
  );

  const Container = skipEnterAnimation ? View : Animated.View;
  const enteringProp = skipEnterAnimation ? {} : { entering: FadeInUp.duration(DURATION.fast).easing(EASING_OUT_CUBIC) };

  return (
    <Container
      {...enteringProp}
      style={[styles.row, isCoach ? styles.rowCoach : styles.rowUser]}
    >
      {isCoach && !compact ? <CoachAvatarIcon size={32} /> : null}
      {isCoach && compact ? <View style={styles.avatarSpacer} /> : null}
      <View style={[styles.bubble, isCoach ? styles.coach : styles.user]}>{bubbleBody}</View>
    </Container>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 8,
    maxWidth: '88%',
  },
  rowCoach: { alignSelf: 'flex-start' },
  rowUser: { alignSelf: 'flex-end' },
  avatarSpacer: { width: 32 },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    flexShrink: 1,
    minHeight: 36,
    justifyContent: 'center',
  },
  coach: {
    backgroundColor: colors.DARK3,
    borderTopLeftRadius: 4,
  },
  user: {
    backgroundColor: colors.LIME,
    borderTopRightRadius: 4,
  },
  coachText: { color: colors.WHITE, fontSize: 15, lineHeight: 21 },
  userText: { color: colors.DARK, fontSize: 15, fontWeight: '600', lineHeight: 21 },
});
