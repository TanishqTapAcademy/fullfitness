import React, { useEffect, useRef } from 'react';
import { Keyboard, Platform, ScrollView, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

interface Props {
  children: React.ReactNode;
  /**
   * Any value that changes when a new message arrives. When this changes we
   * auto-scroll to the bottom.
   */
  scrollKey: number;
}

/**
 * Scrollable message area with auto-scroll-to-bottom when new messages arrive.
 * FlatList would be ideal for long histories; ScrollView is simpler for v1
 * and keeps entrance animations straightforward.
 */
export const ChatScroller: React.FC<Props> = ({ children, scrollKey }) => {
  const ref = useRef<ScrollView>(null);

  useEffect(() => {
    // Defer so newly-added messages measure before we scroll.
    const t = setTimeout(() => {
      ref.current?.scrollToEnd({ animated: true });
    }, 60);
    return () => clearTimeout(t);
  }, [scrollKey]);

  // Scroll to bottom when keyboard opens
  useEffect(() => {
    const event = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const sub = Keyboard.addListener(event, () => {
      setTimeout(() => ref.current?.scrollToEnd({ animated: true }), 100);
    });
    return () => sub.remove();
  }, []);

  return (
    <ScrollView
      ref={ref}
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.DARK,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 2,
  },
});
