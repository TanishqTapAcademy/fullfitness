import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { onboardingRouter } from './routes/onboarding';
import { adminRouter } from './routes/admin';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/onboarding', onboardingRouter);
app.use('/api/admin', adminRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
