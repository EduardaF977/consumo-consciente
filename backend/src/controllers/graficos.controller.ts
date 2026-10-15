import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

type ConsumoComTipo = {
  quantidade: number;
  valorPago: number | null;
  periodo: string;
  tipoConsumo: { nome: string };
};

interface PeriodoDado {
  periodo: string;
  label: string;
  agua: number;
  energia: number;
  valorAgua: number;
  valorEnergia: number;
  variacaoAgua: number | null;
  variacaoEnergia: number | null;
}

export async function obterGraficos(req: AuthRequest, res: Response): Promise<void> {
  try {
    const usuarioId = req.usuarioId!;
    const { meses = '12' } = req.query;

    const qtdMeses = parseInt(meses as string) || 12;
    const agora = new Date();
    const periodos: string[] = [];

    for (let i = qtdMeses - 1; i >= 0; i--) {
      const d = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
      periodos.push(
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      );
    }

    const consumos = await prisma.consumo.findMany({
      where: { usuarioId, periodo: { in: periodos } },
      include: { tipoConsumo: true },
      orderBy: { periodo: 'asc' },
    }) as ConsumoComTipo[];

    const mesesLabel: Record<string, string> = {
      '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr',
      '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Ago',
      '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez',
    };

    // Monta dados base por período (sem variações ainda)
    const dadosBase = periodos.map((p) => {
      const [ano, mes] = p.split('-');
      const dosPeriodo = consumos.filter((c) => c.periodo === p);

      const agua = dosPeriodo
        .filter((c) => c.tipoConsumo.nome === 'Água')
        .reduce((acc, c) => acc + c.quantidade, 0);

      const energia = dosPeriodo
        .filter((c) => c.tipoConsumo.nome === 'Energia')
        .reduce((acc, c) => acc + c.quantidade, 0);

      const valorAgua = dosPeriodo
        .filter((c) => c.tipoConsumo.nome === 'Água' && c.valorPago !== null)
        .reduce((acc, c) => acc + (c.valorPago ?? 0), 0);

      const valorEnergia = dosPeriodo
        .filter((c) => c.tipoConsumo.nome === 'Energia' && c.valorPago !== null)
        .reduce((acc, c) => acc + (c.valorPago ?? 0), 0);

      return {
        periodo: p,
        label: `${mesesLabel[mes]}/${ano.slice(2)}`,
        agua,
        energia,
        valorAgua,
        valorEnergia,
      };
    });

    // Calcular médias (apenas meses com dados)
    const aguaValores = dadosBase.filter((d) => d.agua > 0).map((d) => d.agua);
    const energiaValores = dadosBase.filter((d) => d.energia > 0).map((d) => d.energia);

    const mediaAgua =
      aguaValores.length > 0
        ? aguaValores.reduce((a, b) => a + b, 0) / aguaValores.length
        : null;

    const mediaEnergia =
      energiaValores.length > 0
        ? energiaValores.reduce((a, b) => a + b, 0) / energiaValores.length
        : null;

    // Calcular variações percentuais mês a mês e montar objeto final
    const dados: PeriodoDado[] = dadosBase.map((d, i) => {
      let variacaoAgua: number | null = null;
      let variacaoEnergia: number | null = null;

      if (i > 0) {
        const anterior = dadosBase[i - 1];
        if (anterior.agua > 0) {
          variacaoAgua = ((d.agua - anterior.agua) / anterior.agua) * 100;
        }
        if (anterior.energia > 0) {
          variacaoEnergia = ((d.energia - anterior.energia) / anterior.energia) * 100;
        }
      }

      return { ...d, variacaoAgua, variacaoEnergia };
    });

    res.json({
      dados,
      mediaAgua,
      mediaEnergia,
      periodos,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao gerar dados dos gráficos.' });
  }
}
