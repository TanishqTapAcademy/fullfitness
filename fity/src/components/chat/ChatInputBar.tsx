import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';
import { MicIcon, SendIcon } from '../icons';

interface Props {
  /** Optional — wire up once backend exists. For v1 it just clears the input. */
  onSend?: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const ChatInputBar: React.FC<Props> = ({
  onSend,
  placeholder = 'Message Coach',
  disabled = false,
}) => {
  const [value, setValue] = useState('');
  const canSend = value.trim().length > 0 && !disabled;

  const handleSend = () => {
    if (!canSend) return;
    Haptics.selectionAsync().catch(() => {});
    onSend?.(value.trim());
    setValue('');
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.inputBox}>
        <TextInput
          value={value}
          onChangeText={setValue}
          placeholder={placeholder}
          placeholderTextColor={colors.MUTED}
          style={styles.input}
          editable={!disabled}
          multiline
          maxLength={500}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          blurOnSubmit
        />
        <Pressable hitSlop={8} style={styles.icon} onPress={() => Haptics.selectionAsync().catch(() => {})}>
          <MicIcon size={20} color={colors.MUTED} />
        </Pressable>
      </View>
      <Pressable
        onPress={handleSend}
        disabled={!canSend}
        style={[styles.sendBtn, { opacity: canSend ? 1 : 0.4 }]}
        hitSlop={8}
      >
        <SendIcon size={20} color={colors.DARK} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.DARK,
    borderTopWidth: 1,
    borderTopColor: colors.GRAY,
  },
  inputBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.DARK3,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 6,
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.GRAY,
  },
  input: {
    flex: 1,
    color: colors.WHITE,
    fontSize: 15,
    paddingVertical: 8,
    maxHeight: 100,
  },
  icon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.LIME,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
