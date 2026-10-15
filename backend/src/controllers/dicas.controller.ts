import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export async function listarDicas(req: Request, res: Response): Promise<void> {
  try {
    const { categoria } = req.query;

    const where: Record<string, unknown> = {};
    if (categoria && categoria !== 'Todas') {
      where.categoria = categoria;
    }

    const dicas = await prisma.dica.findMany({
      where,
      include: { tipoConsumo: true },
      orderBy: [{ nivelRelevancia: 'asc' }, { titulo: 'asc' }],
    });

    res.json(dicas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar dicas.' });
  }
}
