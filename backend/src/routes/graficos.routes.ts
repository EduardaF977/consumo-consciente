import { Router } from 'express';
import { obterGraficos } from '../controllers/graficos.controller';
import { autenticar } from '../middleware/auth.middleware';

const router = Router();
router.use(autenticar);
router.get('/', obterGraficos);

export default router;
