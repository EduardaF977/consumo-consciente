import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';

export async function registrar(req: Request, res: Response): Promise<void> {
  try {
    const { nome, email, senha, confirmacaoSenha } = req.body;

    if (!nome || !email || !senha || !confirmacaoSenha) {
      res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Formato de e-mail inválido.' });
      return;
    }

    if (senha !== confirmacaoSenha) {
      res.status(400).json({ error: 'A senha e a confirmação não coincidem.' });
      return;
    }

    if (senha.length < 6) {
      res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres.' });
      return;
    }

    const usuarioExistente = await prisma.usuario.findUnique({ where: { email } });
    if (usuarioExistente) {
      res.status(409).json({ error: 'Este e-mail já está cadastrado.' });
      return;
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const usuario = await prisma.usuario.create({
      data: { nome, email, senha: senhaHash },
      select: { id: true, nome: true, email: true, dataCadastro: true },
    });

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET as string,
      { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as unknown as number }
    );

    res.status(201).json({ usuario, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao registrar usuário.' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
      return;
    }

    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) {
      res.status(401).json({ error: 'Credenciais inválidas.' });
      return;
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      res.status(401).json({ error: 'Credenciais inválidas.' });
      return;
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET as string,
      { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as unknown as number }
    );

    res.json({
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        dataCadastro: usuario.dataCadastro,
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao realizar login.' });
  }
}
