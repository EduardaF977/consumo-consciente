/**
 * Calcula a variação percentual entre dois valores.
 * Retorna null se não houver valor anterior válido.
 */
export function calcularVariacao(atual: number, anterior: number | null): number | null {
  if (anterior === null || anterior === undefined) return null;
  if (anterior === 0) return null; // Evita divisão por zero
  return ((atual - anterior) / anterior) * 100;
}

/**
 * Classifica o comportamento de consumo com base na variação percentual.
 */
export function classificarConsumo(variacao: number | null): string {
  if (variacao === null) return 'Sem comparação disponível';
  if (variacao <= -20) return 'Excelente — consumo bem abaixo do período anterior';
  if (variacao < -5) return 'Bom — consumo abaixo do período anterior';
  if (variacao <= 5) return 'Estável — consumo próximo ao período anterior';
  if (variacao <= 20) return 'Atenção — consumo acima do período anterior';
  return 'Crítico — consumo muito acima do período anterior';
}

/**
 * Gera observação textual sobre o consumo.
 */
export function gerarObservacao(
  tipoNome: string,
  unidade: string,
  quantidade: number,
  variacao: number | null,
  media: number | null
): string {
  const partes: string[] = [];

  partes.push(`Você registrou ${quantidade} ${unidade} de ${tipoNome.toLowerCase()} neste período.`);

  if (media !== null) {
    partes.push(`Sua média histórica é de ${media.toFixed(2)} ${unidade}.`);
  }

  if (variacao === null) {
    partes.push('Ainda não há período anterior para comparação. Continue registrando para acompanhar sua evolução.');
  } else if (variacao > 0) {
    partes.push(`O consumo aumentou ${variacao.toFixed(1)}% em relação ao período anterior. Considere revisar seus hábitos.`);
  } else if (variacao < 0) {
    partes.push(`O consumo reduziu ${Math.abs(variacao).toFixed(1)}% em relação ao período anterior. Ótimo trabalho!`);
  } else {
    partes.push('O consumo se manteve estável em relação ao período anterior.');
  }

  return partes.join(' ');
}

/**
 * Retorna o período anterior no formato YYYY-MM.
 */
export function periodoAnterior(periodo: string): string {
  const [ano, mes] = periodo.split('-').map(Number);
  const data = new Date(ano, mes - 2, 1);
  const novoAno = data.getFullYear();
  const novoMes = String(data.getMonth() + 1).padStart(2, '0');
  return `${novoAno}-${novoMes}`;
}
