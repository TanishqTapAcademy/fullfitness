import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../../src/theme/colors';
import { ChatHeader } from '../../src/components/chat/ChatHeader';
import { ChatScroller } from '../../src/components/chat/ChatScroller';
import { MessageBubble } from '../../src/components/chat/MessageBubble';
import { InlineActionCard } from '../../src/components/chat/InlineActionCard';
import { ChatInputBar } from '../../src/components/chat/ChatInputBar';
import { TraceButton } from '../../src/components/chat/TraceButton';
import { useChatStore, type Msg } from '../../src/store/chatStore';
import { FIRST_MESSAGES } from '../../src/data/chatScripts';
import { DURATION, SPRING_SOFT } from '../../src/theme/motion';

/**
 * Fullscreen Chat. On first mount we play through FIRST_MESSAGES —
 * typing dots then the message, staggered so it feels alive. The last
 * message has a lime CTA that opens the Baseline modal.
 *
 * TraceButton sits over the input bar in the bottom-right. Dragging it
 * up-left peels the chat layer back; tapping opens Trace directly.
 */
export default function Chat() {
  const router = useRouter();
  const { messages, didSeeIntro, push, markIntroSeen } = useChatStore();
  const [typing, setTyping] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Shared value mirrored from TraceButton drag progress (0–1).
  const pullProgress = useSharedValue(0);

  // Play the intro script the first time the user lands here.
  useEffect(() => {
    if (didSeeIntro) return;
    markIntroSeen();

    const timers = timersRef.current;
    let t = 0;
    FIRST_MESSAGES.forEach((m, i) => {
      t += m.delay ?? 400;
      // Show typing indicator first.
      timers.push(
        setTimeout(() => setTyping(true), t - 250),
      );
      timers.push(
        setTimeout(() => {
          setTyping(false);
          push({ id: m.id, from: 'coach', text: m.text, cta: m.cta });
        }, t),
      );
      // Small read-time between messages.
      t += Math.min(1200, 500 + m.text.length * 18);
      if (i === FIRST_MESSAGES.length - 1) {
        timers.push(setTimeout(() => setTyping(false), t));
      }
    });

    return () => {
      timers.forEach(clearTimeout);
      timersRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openBaseline = () => router.push('/(app)/baseline');
  const goHome = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(app)/home');
  };
  const openTrace = () => {
    // Snap the layer back smoothly after the route pushes.
    layerScale.value = withSpring(1, SPRING_SOFT);
    layerRadius.value = withTiming(0, { duration: DURATION.base });
    router.push('/(app)/trace');
  };

  // Chat layer reacts to the pull progress — scales to 0.92 and rounds
  // the bottom-right corner, like a page peeling back.
  const layerScale = useSharedValue(1);
  const layerRadius = useSharedValue(0);

  const layerStyle = useAnimatedStyle(() => {
    const p = pullProgress.value;
    const scale = 1 - p * 0.08; // 1 → 0.92
    const radius = p * 40;
    return {
      transform: [{ scale: layerScale.value * scale }],
      borderBottomRightRadius: layerRadius.value + radius,
      borderBottomLeftRadius: radius * 0.4,
    };
  });

  const handleSend = (text: string) => {
    push({ id: `u-${Date.now()}`, from: 'user', text });
    // Canned ack — keeps v1 feeling alive without a backend.
    setTyping(true);
    const t = setTimeout(() => {
      setTyping(false);
      push({
        id: `c-${Date.now()}`,
        from: 'coach',
        text: "Got it. I'll keep that in mind for today's session.",
      });
    }, 900);
    timersRef.current.push(t);
  };

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.layer, layerStyle]}>
        <ChatHeader onBack={goHome} />
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={80}
        >
          <ChatScroller scrollKey={messages.length + (typing ? 1 : 0)}>
            {messages.map((m: Msg) => (
              <React.Fragment key={m.id}>
                <MessageBubble from={m.from} text={m.text} typewriter={m.from === 'coach'} />
                {m.cta ? (
                  <InlineActionCard
                    label={m.cta.label}
                    onPress={openBaseline}
                    subtitle="~90 seconds · 4 tests"
                  />
                ) : null}
              </React.Fragment>
            ))}
            {typing ? <MessageBubble from="coach" typing /> : null}
          </ChatScroller>
          <ChatInputBar onSend={handleSend} />
        </KeyboardAvoidingView>
      </Animated.View>
      <TraceButton onOpen={openTrace} progressSink={pullProgress} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.DARK },
  layer: {
    flex: 1,
    backgroundColor: colors.DARK,
    overflow: 'hidden',
  },
});
