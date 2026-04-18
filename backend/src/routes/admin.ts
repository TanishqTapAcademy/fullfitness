import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const adminRouter = Router();

// GET all questions (including inactive)
adminRouter.get('/questions', async (_req, res) => {
  try {
    const questions = await prisma.question.findMany({
      orderBy: { order: 'asc' },
    });
    res.json({ questions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// POST create a question
adminRouter.post('/questions', async (req, res) => {
  const { step_id, type, title, subtitle, options, config, coach_response, order, is_active } = req.body;

  if (!step_id || !type || !title || order === undefined) {
    res.status(400).json({ error: 'step_id, type, title, and order are required' });
    return;
  }

  try {
    const question = await prisma.question.create({
      data: { step_id, type, title, subtitle, options, config, coach_response, order, is_active: is_active ?? true },
    });
    res.json({ question });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create question' });
  }
});

// PUT reorder questions (MUST be before :id route)
adminRouter.put('/questions/reorder', async (req, res) => {
  const { order } = req.body;

  if (!Array.isArray(order)) {
    res.status(400).json({ error: 'order must be an array of {id, order}' });
    return;
  }

  try {
    await prisma.$transaction(
      order.map((item: { id: string; order: number }) =>
        prisma.question.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reorder questions' });
  }
});

// PUT update a question
adminRouter.put('/questions/:id', async (req, res) => {
  const { step_id, type, title, subtitle, options, config, coach_response, order, is_active } = req.body;

  try {
    const question = await prisma.question.update({
      where: { id: req.params.id },
      data: { step_id, type, title, subtitle, options, config, coach_response, order, is_active },
    });
    res.json({ question });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update question' });
  }
});

// DELETE (soft delete - set is_active=false)
adminRouter.delete('/questions/:id', async (req, res) => {
  try {
    const question = await prisma.question.update({
      where: { id: req.params.id },
      data: { is_active: false },
    });
    res.json({ question });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

// GET responses with stats
adminRouter.get('/responses', async (req, res) => {
  try {
    const questions = await prisma.question.findMany({
      where: { is_active: true },
      orderBy: { order: 'asc' },
      select: { id: true, step_id: true, title: true, order: true },
    });

    const responses = await prisma.response.findMany({
      include: { question: { select: { step_id: true, title: true } } },
      orderBy: { created_at: 'desc' },
    });

    const userIds = [...new Set(responses.map((r) => r.user_id))];
    const totalQuestions = questions.length;

    const userCompletions = userIds.map((uid) => {
      const userResponses = responses.filter((r) => r.user_id === uid);
      return {
        user_id: uid,
        answered: userResponses.length,
        total: totalQuestions,
        percent: totalQuestions > 0 ? Math.round((userResponses.length / totalQuestions) * 100) : 0,
        responses: userResponses,
      };
    });

    const questionStats = questions.map((q) => {
      const qResponses = responses.filter((r) => r.question_id === q.id);
      return { ...q, response_count: qResponses.length };
    });

    res.json({
      total_users: userIds.length,
      avg_completion: userIds.length > 0
        ? Math.round(userCompletions.reduce((sum, u) => sum + u.percent, 0) / userIds.length)
        : 0,
      question_stats: questionStats,
      users: userCompletions,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch responses' });
  }
});
