import React from 'react';
import { type SharedValue } from 'react-native-reanimated';
import { CornerPullButton } from '../CornerPullButton';

interface Props {
  onOpen: () => void;
  progressSink?: SharedValue<number>;
}

/**
 * Chat → Trace corner-pull entry. Thin wrapper over the shared
 * CornerPullButton so the gesture/visuals stay identical to Home → Chat.
 */
export const TraceButton: React.FC<Props> = ({ onOpen, progressSink }) => (
  <CornerPullButton
    onOpen={onOpen}
    progressSink={progressSink}
    accessibilityLabel="Open Trace"
  />
);
