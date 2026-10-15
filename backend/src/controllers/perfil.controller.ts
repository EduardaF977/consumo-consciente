import { Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export async function obterPerfil(req: AuthRequest, res: Response): Promise<void> {
  try {
    const usuarioId = req.usuarioId!;

    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { id: true, nome: true, email: true, dataCadastro: true },
    });

    if (!usuario) {
      res.status(404).json({ error: 'Usuário não encontrado.' });
      return;
    }

    const totalConsumos = await prisma.consumo.count({ where: { usuarioId } });

    res.json({ ...usuario, totalConsumos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao obter perfil.' });
  }
}

export async function atualizarPerfil(req: AuthRequest, res: Response): Promise<void> {
  try {
    const usuarioId = req.usuarioId!;
    const { nome, email } = req.body;

    if (!nome && !email) {
      res.status(400).json({ error: 'Informe pelo menos um campo para atualizar.' });
      return;
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({ error: 'Formato de e-mail inválido.' });
        return;
      }

      const emailEmUso = await prisma.usuario.findFirst({
        where: { email, NOT: { id: usuarioId } },
      });

      if (emailEmUso) {
        res.status(409).json({ error: 'Este e-mail já está em uso.' });
        return;
      }
    }

    const usuario = await prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        nome: nome || undefined,
        email: email || undefined,
      },
      select: { id: true, nome: true, email: true, dataCadastro: true },
    });

    res.json(usuario);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar perfil.' });
  }
}

export async function alterarSenha(req: AuthRequest, res: Response): Promise<void> {
  try {
    const usuarioId = req.usuarioId!;
    const { senhaAtual, novaSenha, confirmacaoNovaSenha } = req.body;

    if (!senhaAtual || !novaSenha || !confirmacaoNovaSenha) {
      res.status(400).json({ error: 'Todos os campos de senha são obrigatórios.' });
      return;
    }

    if (novaSenha !== confirmacaoNovaSenha) {
      res.status(400).json({ error: 'A nova senha e a confirmação não coincidem.' });
      return;
    }

    if (novaSenha.length < 6) {
      res.status(400).json({ error: 'A nova senha deve ter no mínimo 6 caracteres.' });
      return;
    }

    const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
    if (!usuario) {
      res.status(404).json({ error: 'Usuário não encontrado.' });
      return;
    }

    const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha);
    if (!senhaValida) {
      res.status(401).json({ error: 'Senha atual incorreta.' });
      return;
    }

    const novaHash = await bcrypt.hash(novaSenha, 10);
    await prisma.usuario.update({
      where: { id: usuarioId },
      data: { senha: novaHash },
    });

    res.json({ mensagem: 'Senha alterada com sucesso.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao alterar senha.' });
  }
}
