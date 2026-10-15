import { Router } from 'express';
import {
  listarConsumos,
  obterConsumo,
  criarConsumo,
  atualizarConsumo,
  deletarConsumo,
  listarTipos,
} from '../controllers/consumo.controller';
import { autenticar } from '../middleware/auth.middleware';

const router = Router();

router.use(autenticar);

router.get('/tipos', listarTipos);
router.get('/', listarConsumos);
router.get('/:id', obterConsumo);
router.post('/', criarConsumo);
router.put('/:id', atualizarConsumo);
router.delete('/:id', deletarConsumo);

export default router;
