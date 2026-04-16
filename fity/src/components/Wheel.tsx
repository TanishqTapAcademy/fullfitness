import React, { useCallback, useRef } from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';

interface Props {
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  visibleCount?: number;
}

const ITEM_HEIGHT = 56;

export const Wheel: React.FC<Props> = ({
  min,
  max,
  value,
  onChange,
  suffix,
  visibleCount = 5,
}) => {
  const data = React.useMemo(
    () => Array.from({ length: max - min + 1 }, (_, i) => min + i),
    [min, max],
  );
  const listRef = useRef<FlatList<number>>(null);
  const lastIndex = useRef(value - min);
  const lastTickIndex = useRef(value - min);
  const isScrolling = useRef(false);

  const height = ITEM_HEIGHT * visibleCount;
  const pad = (height - ITEM_HEIGHT) / 2;

  const handleEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y;
      const idx = Math.round(y / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(data.length - 1, idx));
      if (clamped !== lastIndex.current) {
        lastIndex.current = clamped;
        Haptics.selectionAsync().catch(() => {});
        onChange(data[clamped]);
      }
    },
    [data, onChange],
  );

  const initialIndex = Math.max(0, value - min);

  return (
    <View style={[styles.wrap, { height }]}>
      <View
        pointerEvents="none"
        style={[
          styles.selection,
          { top: pad, height: ITEM_HEIGHT },
        ]}
      />
      <FlatList
        ref={listRef}
        data={data}
        keyExtractor={(i) => String(i)}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        snapToAlignment="start"
        decelerationRate={0.992}
        disableIntervalMomentum={false}
        pagingEnabled={false}
        initialScrollIndex={initialIndex}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        contentContainerStyle={{ paddingVertical: pad }}
        scrollEventThrottle={16}
        onScrollBeginDrag={() => {
          isScrolling.current = true;
        }}
        onScroll={(e) => {
          if (!isScrolling.current) return;
          const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
          if (idx !== lastTickIndex.current) {
            lastTickIndex.current = idx;
            Haptics.selectionAsync().catch(() => {});
          }
        }}
        onMomentumScrollEnd={(e) => {
          isScrolling.current = false;
          handleEnd(e);
        }}
        onScrollEndDrag={handleEnd}
        renderItem={({ item }) => {
          const active = item === value;
          return (
            <View style={styles.item}>
              <Text
                style={[
                  styles.text,
                  {
                    color: active ? colors.LIME : colors.MUTED,
                    fontWeight: active ? '700' : '500',
                    fontSize: active ? 28 : 22,
                  },
                ]}
              >
                {item}
                {suffix ? <Text style={styles.suffix}> {suffix}</Text> : null}
              </Text>
            </View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
  },
  selection: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderRadius: 14,
    backgroundColor: 'rgba(232,255,107,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(232,255,107,0.3)',
  },
  item: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { fontVariant: ['tabular-nums'] },
  suffix: { fontSize: 14, color: colors.MUTED },
});
