import React from 'react';
import { StyleSheet, View, ScrollView, ViewStyle, StyleProp } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, Easing } from 'react-native-reanimated';
import { colors } from '../theme/colors';
import { BackButton } from './BackButton';
import { CommitmentChips } from './CommitmentChips';

interface Props {
  step: number;
  children: React.ReactNode;
  footer?: React.ReactNode;
  hideBack?: boolean;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  showProgress?: boolean;
}

export const ScreenShell: React.FC<Props> = ({
  step,
  children,
  footer,
  hideBack = false,
  scroll = true,
  contentStyle,
  showProgress = true,
}) => {
  const insets = useSafeAreaInsets();

  const Inner = scroll ? ScrollView : View;
  const innerProps = scroll
    ? {
        contentContainerStyle: [styles.content, contentStyle],
        showsVerticalScrollIndicator: false,
      }
    : { style: [styles.content, contentStyle] };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 10 }]}>
      <View style={styles.header}>
        {hideBack ? <View style={{ width: 44 }} /> : <BackButton />}
        <View style={{ flex: 1 }} />
      </View>
      {step >= 2 ? <CommitmentChips /> : null}
      <Animated.View
        style={styles.animatedFill}
        entering={FadeIn.duration(320)
          .easing(Easing.out(Easing.cubic))
          .withInitialValues({ transform: [{ translateY: 12 }], opacity: 0 })}
      >
        <Inner {...innerProps}>{children}</Inner>
      </Animated.View>
      {footer ? (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>{footer}</View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.DARK,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  progressWrap: {
    flex: 1,
  },
  animatedFill: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 24,
    flexGrow: 1,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    backgroundColor: colors.DARK,
  },
});
