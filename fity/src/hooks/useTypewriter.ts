import { useEffect, useRef, useState } from 'react';

interface Options {
  text: string;
  /** Milliseconds per character. Default 28. */
  speed?: number;
  /** Delay before starting, in ms. */
  startDelay?: number;
  /** If false, the full string is returned immediately (reduced motion). */
  enabled?: boolean;
  onDone?: () => void;
}

/**
 * Reveals a string character-by-character. Returns the currently-visible
 * substring and a `done` flag.
 */
export function useTypewriter({
  text,
  speed = 28,
  startDelay = 0,
  enabled = true,
  onDone,
}: Options) {
  const [visible, setVisible] = useState('');
  const [done, setDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) {
      setVisible(text);
      setDone(true);
      onDone?.();
      return;
    }

    setVisible('');
    setDone(false);
    let i = 0;

    const tick = () => {
      i += 1;
      setVisible(text.slice(0, i));
      if (i >= text.length) {
        setDone(true);
        onDone?.();
        return;
      }
      timerRef.current = setTimeout(tick, speed);
    };

    timerRef.current = setTimeout(tick, startDelay);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // onDone intentionally omitted — treat as stable callback
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, speed, startDelay, enabled]);

  return { visible, done };
}
