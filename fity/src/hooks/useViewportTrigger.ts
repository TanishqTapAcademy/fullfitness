import { useCallback, useRef, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';

/**
 * Fires once when an item's layout registers (i.e. becomes mounted / visible
 * in scroll). This is deliberately simple — we don't track scroll position in
 * v1; cards inside a ScrollView mount when approached because React Native's
 * virtualization keeps them alive once measured. For strict off-screen
 * detection a scroll-handler-based approach can be added later.
 */
export function useViewportTrigger() {
  const [triggered, setTriggered] = useState(false);
  const hasFired = useRef(false);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    if (hasFired.current) return;
    if (e.nativeEvent.layout.height > 0) {
      hasFired.current = true;
      setTriggered(true);
    }
  }, []);

  return { triggered, onLayout };
}
