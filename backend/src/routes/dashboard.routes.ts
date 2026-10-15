import { Router } from 'express';
import { obterDashboard } from '../controllers/dashboard.controller';
import { autenticar } from '../middleware/auth.middleware';

const router = Router();
router.use(autenticar);
router.get('/', obterDashboard);

export default router;
