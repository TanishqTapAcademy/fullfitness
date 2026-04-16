import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenShell } from '../../src/components/ScreenShell';
import { GridCard } from '../../src/components/GridCard';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { CoachReply } from '../../src/components/CoachReply';
import { equipData, type EquipItem } from '../../src/data/onboarding';
import { useOnboardingStore } from '../../src/store/onboardingStore';
import {
  GymIcon,
  HomeIcon,
  BodyIcon,
  QuestionIcon,
  type IconProps,
} from '../../src/components/icons';
import { colors } from '../../src/theme/colors';

const iconMap: Record<EquipItem['icon'], React.FC<IconProps>> = {
  gym: GymIcon,
  home: HomeIcon,
  body: BodyIcon,
  question: QuestionIcon,
};

export default function EquipmentScreen() {
  const router = useRouter();
  const { equip, setEquip } = useOnboardingStore();
  const canContinue = equip !== null;

  return (
    <ScreenShell
      step={2}
      footer={
        <PrimaryButton
          label="Continue"
          disabled={!canContinue}
          onPress={() => router.push('/onboarding/experience')}
        />
      }
    >
      <Text style={styles.title}>What can you use?</Text>
      <Text style={styles.sub}>This shapes every exercise I pick.</Text>

      <View style={styles.grid}>
        <View style={styles.row}>
          {equipData.slice(0, 2).map((e) => {
            const Icon = iconMap[e.icon];
            return (
              <GridCard
                key={e.id}
                icon={<Icon size={24} color={colors.LIME} />}
                label={e.label}
                desc={e.desc}
                selected={equip === e.id}
                onPress={() => setEquip(e.id)}
              />
            );
          })}
        </View>
        <View style={styles.row}>
          {equipData.slice(2, 4).map((e) => {
            const Icon = iconMap[e.icon];
            return (
              <GridCard
                key={e.id}
                icon={<Icon size={24} color={colors.LIME} />}
                label={e.label}
                desc={e.desc}
                selected={equip === e.id}
                onPress={() => setEquip(e.id)}
              />
            );
          })}
        </View>
      </View>

      {canContinue ? (
        <CoachReply text="Locked in — I'll only pick moves that fit your setup." />
      ) : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.WHITE, fontSize: 28, fontWeight: '800' },
  sub: { color: colors.MUTED, fontSize: 15, marginTop: 6 },
  grid: { marginTop: 20, gap: 12 },
  row: { flexDirection: 'row', gap: 12 },
});
