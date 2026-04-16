export type BaselineTestId = 'squat' | 'pushup' | 'plank' | 'hinge';
export type BaselineResult = 'good' | 'ok' | 'flag';

export interface BaselineTest {
  id: BaselineTestId;
  title: string;
  hint: string;
  /** Short cue shown under the illustration. */
  cue: string;
  /** Key used by BaselineTestCard to pick the right SVG. */
  illustration: BaselineTestId;
}

export const BASELINE_TESTS: BaselineTest[] = [
  {
    id: 'squat',
    title: 'Bodyweight squat',
    hint: 'Lower to a chair-height, drive through mid-foot.',
    cue: 'Aim for 5 clean reps.',
    illustration: 'squat',
  },
  {
    id: 'pushup',
    title: 'Push-up',
    hint: 'Elbows ~45°, ribs tucked, full range.',
    cue: 'Knees or toes — your choice.',
    illustration: 'pushup',
  },
  {
    id: 'plank',
    title: 'Plank hold',
    hint: 'Stack shoulders over elbows, glutes tight.',
    cue: 'Hold for 20 seconds.',
    illustration: 'plank',
  },
  {
    id: 'hinge',
    title: 'Hip hinge',
    hint: 'Push hips back, soft knees, flat back.',
    cue: '5 slow reps.',
    illustration: 'hinge',
  },
];
