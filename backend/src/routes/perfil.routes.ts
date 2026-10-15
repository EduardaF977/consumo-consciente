import { Router } from 'express';
import { obterPerfil, atualizarPerfil, alterarSenha } from '../controllers/perfil.controller';
import { autenticar } from '../middleware/auth.middleware';

const router = Router();
router.use(autenticar);
router.get('/', obterPerfil);
router.put('/', atualizarPerfil);
router.put('/senha', alterarSenha);

export default router;
