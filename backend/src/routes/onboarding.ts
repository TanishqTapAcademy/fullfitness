import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const onboardingRouter = Router();

// GET all active questions (ordered)
onboardingRouter.get('/questions', async (_req, res) => {
  try {
    const questions = await prisma.question.findMany({
      where: { is_active: true },
      orderBy: { order: 'asc' },
    });
    res.json({ questions });
  } catch (err) {
    console.error('Fetch questions error:', err);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// POST save a single response (upsert)
onboardingRouter.post('/responses', async (req, res) => {
  const { user_id, question_id, answer } = req.body;

  if (!user_id || !question_id || answer === undefined) {
    res.status(400).json({ error: 'user_id, question_id, and answer are required' });
    return;
  }

  try {
    const response = await prisma.response.upsert({
      where: {
        user_id_question_id: { user_id, question_id },
      },
      update: { answer },
      create: { user_id, question_id, answer },
    });
    res.json({ success: true, response });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save response' });
  }
});

// GET all responses for a user + completion stats
onboardingRouter.get('/responses/:userId', async (req, res) => {
  try {
    const totalQuestions = await prisma.question.count({
      where: { is_active: true },
    });

    const responses = await prisma.response.findMany({
      where: { user_id: req.params.userId },
      include: { question: true },
      orderBy: { question: { order: 'asc' } },
    });

    res.json({
      responses,
      completion: {
        answered: responses.length,
        total: totalQuestions,
        percent: totalQuestions > 0 ? Math.round((responses.length / totalQuestions) * 100) : 0,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch responses' });
  }
});
