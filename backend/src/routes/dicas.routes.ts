import { Router } from 'express';
import { listarDicas } from '../controllers/dicas.controller';

const router = Router();
router.get('/', listarDicas);

export default router;
