import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const seedQuestions = [
  {
    step_id: 'goals',
    type: 'multi_select',
    title: 'What are your goals?',
    subtitle: "Select what matters. I'll program the rest.",
    order: 1,
    options: [
      { id: 'lose_fat', icon: 'fire', label: 'Lose fat', desc: 'Cut body fat, look leaner' },
      { id: 'build_muscle', icon: 'dumbbell', label: 'Build muscle', desc: 'Gain size and strength' },
      { id: 'get_fit', icon: 'target', label: 'Get fit', desc: 'Improve overall fitness' },
      { id: 'stay_healthy', icon: 'heart', label: 'Stay healthy', desc: 'Move daily, feel good' },
      { id: 'gain_energy', icon: 'bolt', label: 'More energy', desc: 'Beat fatigue, feel sharp' },
      { id: 'mental', icon: 'brain', label: 'Mental clarity', desc: 'Reduce stress, focus better' },
    ],
    config: { min_select: 1, max_select: 6 },
    coach_response: {
      single: "Great pick. We'll focus on {label}.",
      multi: "Nice combo — we'll balance {count} goals in your plan.",
    },
  },
  {
    step_id: 'equipment',
    type: 'grid_select',
    title: 'What can you use?',
    subtitle: 'This shapes every exercise I pick.',
    order: 2,
    options: [
      { id: 'full_gym', icon: 'gym', label: 'Full gym', desc: 'Access to everything' },
      { id: 'home', icon: 'home', label: 'Home setup', desc: 'Some dumbbells / bands' },
      { id: 'bodyweight', icon: 'body', label: 'Bodyweight', desc: 'No equipment needed' },
      { id: 'not_sure', icon: 'question', label: 'Not sure', desc: "We'll figure it out" },
    ],
    config: { columns: 2, select_mode: 'single' },
    coach_response: {
      default: "Locked in — I'll only pick moves that fit your setup.",
    },
  },
  {
    step_id: 'experience',
    type: 'single_select',
    title: 'How experienced are you?',
    subtitle: 'So we pick the right starting intensity.',
    order: 3,
    options: [
      { id: 'beginner', label: 'Beginner', desc: 'New to training' },
      { id: 'some', label: 'Some experience', desc: 'Trained on and off' },
      { id: 'consistent', label: 'Consistent', desc: 'Train 2-3x a week' },
      { id: 'advanced', label: 'Advanced', desc: '4+ sessions weekly' },
    ],
    config: null,
    coach_response: {
      default: "Got it. We'll start where you are and progress from there.",
    },
  },
  {
    step_id: 'height',
    type: 'wheel',
    title: 'How tall are you?',
    subtitle: 'Quick stats for precision. Skip if you want.',
    order: 4,
    options: null,
    config: { min: 140, max: 220, default: 175, suffix: 'cm' },
    coach_response: null,
  },
  {
    step_id: 'weight',
    type: 'wheel',
    title: 'What do you weigh?',
    subtitle: 'Quick stats for precision. Skip if you want.',
    order: 5,
    options: null,
    config: { min: 35, max: 180, default: 70, suffix: 'kg' },
    coach_response: null,
  },
  {
    step_id: 'quit_reason',
    type: 'chat_select',
    title: 'Meet your coach',
    subtitle: 'A quick chat to make this plan yours.',
    order: 6,
    options: [
      { id: 'boring', label: 'Got bored' },
      { id: 'time', label: 'No time' },
      { id: 'results', label: 'No results' },
      { id: 'motivation', label: 'Lost motivation' },
    ],
    config: { style: 'chat_bubbles' },
    coach_response: {
      intro_messages: [
        'Your program is ready. Want to see it?',
        "One quick question first — it'll shape how I coach you.",
        "What's usually stopped you from sticking with training?",
      ],
      reply: "Understood. I've built a short, progressive week 1 so you win early. Let's preview it.",
    },
  },
];

async function main() {
  console.log('Seeding questions...');

  for (const q of seedQuestions) {
    await prisma.question.upsert({
      where: { step_id: q.step_id },
      update: { ...q },
      create: { ...q },
    });
    console.log(`  ✓ ${q.step_id}`);
  }

  console.log('Seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
