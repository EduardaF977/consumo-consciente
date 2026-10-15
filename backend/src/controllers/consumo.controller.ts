import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import {
  calcularVariacao,
  classificarConsumo,
  gerarObservacao,
  periodoAnterior,
} from '../utils/analise';

export async function listarConsumos(req: AuthRequest, res: Response): Promise<void> {
  try {
    const usuarioId = req.usuarioId!;
    const { tipo, periodoInicio, periodoFim } = req.query;

    const where: Record<string, unknown> = { usuarioId };

    if (tipo) {
      where.tipoConsumo = { nome: tipo };
    }

    if (periodoInicio || periodoFim) {
      const periodoFilter: Record<string, string> = {};
      if (periodoInicio) periodoFilter.gte = periodoInicio as string;
      if (periodoFim) periodoFilter.lte = periodoFim as string;
      where.periodo = periodoFilter;
    }

    const consumos = await prisma.consumo.findMany({
      where,
      include: {
        tipoConsumo: true,
        analise: true,
      },
      orderBy: [{ periodo: 'desc' }, { dataRegistro: 'desc' }],
    });

    res.json(consumos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar consumos.' });
  }
}

export async function obterConsumo(req: AuthRequest, res: Response): Promise<void> {
  try {
    const usuarioId = req.usuarioId!;
    const id = parseInt(req.params.id);

    const consumo = await prisma.consumo.findFirst({
      where: { id, usuarioId },
      include: { tipoConsumo: true, analise: true },
    });

    if (!consumo) {
      res.status(404).json({ error: 'Registro não encontrado.' });
      return;
    }

    res.json(consumo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao obter consumo.' });
  }
}

export async function criarConsumo(req: AuthRequest, res: Response): Promise<void> {
  try {
    const usuarioId = req.usuarioId!;
    const { tipoConsumoId, quantidade, periodo, valorPago } = req.body;

    if (!tipoConsumoId || quantidade === undefined || !periodo) {
      res.status(400).json({ error: 'Tipo de consumo, quantidade e período são obrigatórios.' });
      return;
    }

    if (quantidade < 0) {
      res.status(400).json({ error: 'A quantidade não pode ser negativa.' });
      return;
    }

    const periodoRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
    if (!periodoRegex.test(periodo)) {
      res.status(400).json({ error: 'Período inválido. Use o formato AAAA-MM.' });
      return;
    }

    const tipoConsumo = await prisma.tipoConsumo.findUnique({
      where: { id: parseInt(tipoConsumoId) },
    });

    if (!tipoConsumo) {
      res.status(400).json({ error: 'Tipo de consumo inválido.' });
      return;
    }

    // Criar consumo
    const consumo = await prisma.consumo.create({
      data: {
        quantidade: parseFloat(quantidade),
        periodo,
        valorPago: valorPago !== undefined && valorPago !== '' ? parseFloat(valorPago) : null,
        usuarioId,
        tipoConsumoId: parseInt(tipoConsumoId),
      },
      include: { tipoConsumo: true },
    });

    // Calcular análise
    const periodoAnt = periodoAnterior(periodo);

    const consumoAnterior = await prisma.consumo.findFirst({
      where: { usuarioId, tipoConsumoId: parseInt(tipoConsumoId), periodo: periodoAnt },
    });

    const todosPeriodos = await prisma.consumo.findMany({
      where: { usuarioId, tipoConsumoId: parseInt(tipoConsumoId) },
      select: { quantidade: true },
    });

    const media =
      todosPeriodos.length > 0
        ? todosPeriodos.reduce((acc: number, c: { quantidade: number }) => acc + c.quantidade, 0) / todosPeriodos.length
        : null;

    const variacao = calcularVariacao(
      consumo.quantidade,
      consumoAnterior ? consumoAnterior.quantidade : null
    );
    const classificacao = classificarConsumo(variacao);
    const observacao = gerarObservacao(
      tipoConsumo.nome,
      tipoConsumo.unidadeMedida,
      consumo.quantidade,
      variacao,
      media
    );

    const analise = await prisma.analiseConsumo.create({
      data: {
        consumoCalculado: consumo.quantidade,
        mediaConsumo: media,
        variacaoConsumo: variacao,
        classificacao,
        observacao,
        consumoId: consumo.id,
      },
    });

    res.status(201).json({ consumo: { ...consumo, analise } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao registrar consumo.' });
  }
}

export async function atualizarConsumo(req: AuthRequest, res: Response): Promise<void> {
  try {
    const usuarioId = req.usuarioId!;
    const id = parseInt(req.params.id);
    const { quantidade, periodo, valorPago, tipoConsumoId } = req.body;

    const consumoExistente = await prisma.consumo.findFirst({
      where: { id, usuarioId },
    });

    if (!consumoExistente) {
      res.status(404).json({ error: 'Registro não encontrado.' });
      return;
    }

    if (quantidade !== undefined && quantidade < 0) {
      res.status(400).json({ error: 'A quantidade não pode ser negativa.' });
      return;
    }

    if (periodo) {
      const periodoRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
      if (!periodoRegex.test(periodo)) {
        res.status(400).json({ error: 'Período inválido. Use o formato AAAA-MM.' });
        return;
      }
    }

    const consumoAtualizado = await prisma.consumo.update({
      where: { id },
      data: {
        quantidade: quantidade !== undefined ? parseFloat(quantidade) : undefined,
        periodo: periodo || undefined,
        valorPago: valorPago !== undefined ? (valorPago === '' ? null : parseFloat(valorPago)) : undefined,
        tipoConsumoId: tipoConsumoId ? parseInt(tipoConsumoId) : undefined,
      },
      include: { tipoConsumo: true },
    });

    // Recalcular análise
    const tipoId = consumoAtualizado.tipoConsumoId;
    const periodoAtual = consumoAtualizado.periodo;
    const periodoAnt = periodoAnterior(periodoAtual);

    const consumoAnterior = await prisma.consumo.findFirst({
      where: { usuarioId, tipoConsumoId: tipoId, periodo: periodoAnt, NOT: { id } },
    });

    const todosPeriodos = await prisma.consumo.findMany({
      where: { usuarioId, tipoConsumoId: tipoId },
      select: { quantidade: true },
    });

    const media =
      todosPeriodos.length > 0
        ? todosPeriodos.reduce((acc: number, c: { quantidade: number }) => acc + c.quantidade, 0) / todosPeriodos.length
        : null;

    const variacao = calcularVariacao(
      consumoAtualizado.quantidade,
      consumoAnterior ? consumoAnterior.quantidade : null
    );
    const classificacao = classificarConsumo(variacao);
    const observacao = gerarObservacao(
      consumoAtualizado.tipoConsumo.nome,
      consumoAtualizado.tipoConsumo.unidadeMedida,
      consumoAtualizado.quantidade,
      variacao,
      media
    );

    await prisma.analiseConsumo.upsert({
      where: { consumoId: id },
      update: {
        consumoCalculado: consumoAtualizado.quantidade,
        mediaConsumo: media,
        variacaoConsumo: variacao,
        classificacao,
        observacao,
        dataAnalise: new Date(),
      },
      create: {
        consumoCalculado: consumoAtualizado.quantidade,
        mediaConsumo: media,
        variacaoConsumo: variacao,
        classificacao,
        observacao,
        consumoId: id,
      },
    });

    const consumoFinal = await prisma.consumo.findFirst({
      where: { id },
      include: { tipoConsumo: true, analise: true },
    });

    res.json(consumoFinal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar consumo.' });
  }
}

export async function deletarConsumo(req: AuthRequest, res: Response): Promise<void> {
  try {
    const usuarioId = req.usuarioId!;
    const id = parseInt(req.params.id);

    const consumo = await prisma.consumo.findFirst({
      where: { id, usuarioId },
    });

    if (!consumo) {
      res.status(404).json({ error: 'Registro não encontrado.' });
      return;
    }

    await prisma.consumo.delete({ where: { id } });

    res.json({ mensagem: 'Registro excluído com sucesso.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao excluir consumo.' });
  }
}

export async function listarTipos(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const tipos = await prisma.tipoConsumo.findMany();
    res.json(tipos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar tipos de consumo.' });
  }
}
