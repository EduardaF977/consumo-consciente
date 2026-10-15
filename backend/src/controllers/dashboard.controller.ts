import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

type ConsumoComTipo = {
  quantidade: number;
  valorPago: number | null;
  periodo: string;
  tipoConsumo: { nome: string };
};

function somarQuantidade(lista: ConsumoComTipo[], nomeTipo: string): number {
  return lista
    .filter((c) => c.tipoConsumo.nome === nomeTipo)
    .reduce((acc, c) => acc + c.quantidade, 0);
}

function somarValor(lista: ConsumoComTipo[], nomeTipo: string): number {
  return lista
    .filter((c) => c.tipoConsumo.nome === nomeTipo && c.valorPago !== null)
    .reduce((acc, c) => acc + (c.valorPago ?? 0), 0);
}

export async function obterDashboard(req: AuthRequest, res: Response): Promise<void> {
  try {
    const usuarioId = req.usuarioId!;
    const { periodo } = req.query;

    const periodoAtual =
      (periodo as string) ||
      `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

    const [ano, mes] = periodoAtual.split('-').map(Number);
    const dataAnt = new Date(ano, mes - 2, 1);
    const periodoAnterior = `${dataAnt.getFullYear()}-${String(dataAnt.getMonth() + 1).padStart(2, '0')}`;

    const tipos = await prisma.tipoConsumo.findMany();
    const tipoAgua = tipos.find((t: { nome: string }) => t.nome === 'Água');
    const tipoEnergia = tipos.find((t: { nome: string }) => t.nome === 'Energia');

    const consumosAtual = await prisma.consumo.findMany({
      where: { usuarioId, periodo: periodoAtual },
      include: { tipoConsumo: true },
    }) as ConsumoComTipo[];

    const consumosAnteriores = await prisma.consumo.findMany({
      where: { usuarioId, periodo: periodoAnterior },
      include: { tipoConsumo: true },
    }) as ConsumoComTipo[];

    const totalAguaAtual = somarQuantidade(consumosAtual, 'Água');
    const totalEnergiaAtual = somarQuantidade(consumosAtual, 'Energia');
    const totalAguaAnterior = somarQuantidade(consumosAnteriores, 'Água');
    const totalEnergiaAnterior = somarQuantidade(consumosAnteriores, 'Energia');
    const valorAguaAtual = somarValor(consumosAtual, 'Água');
    const valorEnergiaAtual = somarValor(consumosAtual, 'Energia');

    const variacaoAgua =
      totalAguaAnterior > 0
        ? ((totalAguaAtual - totalAguaAnterior) / totalAguaAnterior) * 100
        : null;

    const variacaoEnergia =
      totalEnergiaAnterior > 0
        ? ((totalEnergiaAtual - totalEnergiaAnterior) / totalEnergiaAnterior) * 100
        : null;

    // Médias históricas
    const todasAgua = tipoAgua
      ? await prisma.consumo.findMany({
          where: { usuarioId, tipoConsumoId: tipoAgua.id },
          select: { quantidade: true },
        })
      : [];

    const todaEnergia = tipoEnergia
      ? await prisma.consumo.findMany({
          where: { usuarioId, tipoConsumoId: tipoEnergia.id },
          select: { quantidade: true },
        })
      : [];

    const mediaAgua =
      todasAgua.length > 0
        ? todasAgua.reduce((acc: number, c: { quantidade: number }) => acc + c.quantidade, 0) / todasAgua.length
        : null;

    const mediaEnergia =
      todaEnergia.length > 0
        ? todaEnergia.reduce((acc: number, c: { quantidade: number }) => acc + c.quantidade, 0) / todaEnergia.length
        : null;

    // Dica aleatória
    const totalDicas = await prisma.dica.count();
    const dica =
      totalDicas > 0
        ? await prisma.dica.findFirst({
            skip: Math.floor(Math.random() * totalDicas),
          })
        : null;

    // Últimos 6 meses para gráfico resumido
    const ultimosPeriodos: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(ano, mes - 1 - i, 1);
      ultimosPeriodos.push(
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      );
    }

    const consumosGrafico = await prisma.consumo.findMany({
      where: { usuarioId, periodo: { in: ultimosPeriodos } },
      include: { tipoConsumo: true },
    }) as ConsumoComTipo[];

    const mesesLabel = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    const dadosGrafico = ultimosPeriodos.map((p) => {
      const dosPeriodo = consumosGrafico.filter((c) => c.periodo === p);
      const agua = somarQuantidade(dosPeriodo, 'Água');
      const energia = somarQuantidade(dosPeriodo, 'Energia');
      const [y, m] = p.split('-');
      return {
        periodo: p,
        label: `${mesesLabel[parseInt(m) - 1]}/${y.slice(2)}`,
        agua,
        energia,
      };
    });

    const totalRegistros = await prisma.consumo.count({ where: { usuarioId } });

    res.json({
      periodo: periodoAtual,
      totalAguaAtual,
      totalEnergiaAtual,
      totalAguaAnterior,
      totalEnergiaAnterior,
      variacaoAgua,
      variacaoEnergia,
      valorAguaAtual,
      valorEnergiaAtual,
      mediaAgua,
      mediaEnergia,
      dadosGrafico,
      dica,
      totalRegistros,
      dataGeracao: new Date().toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao gerar dashboard.' });
  }
}
