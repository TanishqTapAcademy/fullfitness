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
import { useAuthStore } from '../../src/store/authStore';
import { useProgressStore } from '../../src/store/progressStore';
import { FIRST_MESSAGES } from '../../src/data/chatScripts';
import { DURATION, SPRING_SOFT } from '../../src/theme/motion';
import { sendMessage, getHistory, streamOpener, type SSEEvent } from '../../src/services/chatApi';
import { trackEvent } from '../../src/services/posthog';

export default function Chat() {
  const router = useRouter();
  const {
    messages, didSeeIntro, streaming, openerShownThisSession,
    push, markIntroSeen, markOpenerShown, startStream, appendToStream, finishStream,
    addExtraction, loadHistory, setLoading,
  } = useChatStore();
  const session = useAuthStore((s) => s.session);
  const handleExtraction = useProgressStore((s) => s.handleExtraction);
  const [typing, setTyping] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const pullProgress = useSharedValue(0);
  const layerScale = useSharedValue(1);
  const layerRadius = useSharedValue(0);

  const isAuthenticated = !!session?.access_token;

  // Track chat opened
  useEffect(() => {
    trackEvent('chat_opened', { is_authenticated: isAuthenticated });
  }, []);

  // Load history + proactive opener for authenticated users
  useEffect(() => {
    if (!isAuthenticated || historyLoaded) return;
    setHistoryLoaded(true);

    (async () => {
      try {
        const { messages: history } = await getHistory();
        if (history.length > 0) {
          const mapped: Msg[] = history.map((m) => ({
            id: m.id,
            from: m.role === 'user' ? 'user' : 'coach',
            text: m.content,
            ts: new Date(m.created_at).getTime(),
          }));
          loadHistory(mapped);
          markIntroSeen();
        }

        // Stream LLM opener only once per app session (not on tab switches)
        if (!openerShownThisSession) {
          markOpenerShown();
          const openerId = `opener-${Date.now()}`;
          startStream(openerId);
          markIntroSeen();
          try {
            await streamOpener((event: SSEEvent) => {
              switch (event.type) {
                case 'token':
                  if (event.content) appendToStream(openerId, event.content);
                  break;
                case 'done':
                  finishStream(openerId);
                  break;
                case 'error':
                  appendToStream(openerId, event.message || 'Hey. What are we working on today?');
                  finishStream(openerId);
                  break;
              }
            });
          } catch {
            appendToStream(openerId, 'Hey. What are we working on today?');
            finishStream(openerId);
          }
        }
      } catch {
        // Fallback to intro script
      }
    })();
  }, [isAuthenticated]);

  // Play intro script for unauthenticated or first-time users
  useEffect(() => {
    if (didSeeIntro || isAuthenticated) return;
    markIntroSeen();

    const timers = timersRef.current;
    let t = 0;
    FIRST_MESSAGES.forEach((m, i) => {
      t += m.delay ?? 400;
      timers.push(setTimeout(() => setTyping(true), t - 250));
      timers.push(
        setTimeout(() => {
          setTyping(false);
          push({ id: m.id, from: 'coach', text: m.text, cta: m.cta });
        }, t),
      );
      t += Math.min(1200, 500 + m.text.length * 18);
      if (i === FIRST_MESSAGES.length - 1) {
        timers.push(setTimeout(() => setTyping(false), t));
      }
    });

    return () => {
      timers.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, []);

  const openBaseline = () => router.push('/(app)/baseline');
  const goHome = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(app)/home');
  };
  const openTrace = () => {
    layerScale.value = withSpring(1, SPRING_SOFT);
    layerRadius.value = withTiming(0, { duration: DURATION.base });
    router.push('/(app)/trace');
  };

  const layerStyle = useAnimatedStyle(() => {
    const p = pullProgress.value;
    const scale = 1 - p * 0.08;
    const radius = p * 40;
    return {
      transform: [{ scale: layerScale.value * scale }],
      borderBottomRightRadius: layerRadius.value + radius,
      borderBottomLeftRadius: radius * 0.4,
    };
  });

  const handleSend = async (text: string) => {
    trackEvent('message_sent', { message_length: text.length });
    push({ id: `u-${Date.now()}`, from: 'user', text });

    if (!isAuthenticated) {
      // Canned ack for unauthenticated users
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
      return;
    }

    // Authenticated: stream from LangGraph agent
    const streamId = `stream-${Date.now()}`;
    setTyping(true);
    startStream(streamId);
    setTyping(false);

    try {
      await sendMessage(text, (event: SSEEvent) => {
        switch (event.type) {
          case 'token':
            if (event.content) {
              appendToStream(streamId, event.content);
            }
            break;
          case 'extraction':
            if (event.logs) {
              trackEvent('extraction_received', { count: event.logs.length });
              addExtraction(event.logs);
              handleExtraction(event.logs);
            }
            break;
          case 'done':
            finishStream(streamId);
            break;
          case 'error':
            appendToStream(streamId, event.message || 'Something went wrong.');
            finishStream(streamId);
            break;
        }
      });
    } catch {
      appendToStream(streamId, 'Connection lost. Try again.');
      finishStream(streamId);
    }
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
                <MessageBubble
                  from={m.from}
                  text={m.text}
                  skipEnterAnimation={m.streaming}
                />
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
