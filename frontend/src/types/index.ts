export interface Usuario {
  id: number;
  nome: string;
  email: string;
  dataCadastro: string;
}

export interface TipoConsumo {
  id: number;
  nome: string;
  unidadeMedida: string;
}

export interface AnaliseConsumo {
  id: number;
  consumoCalculado: number;
  mediaConsumo: number | null;
  variacaoConsumo: number | null;
  classificacao: string | null;
  observacao: string | null;
  dataAnalise: string;
  consumoId: number;
}

export interface Consumo {
  id: number;
  quantidade: number;
  periodo: string;
  valorPago: number | null;
  dataRegistro: string;
  usuarioId: number;
  tipoConsumoId: number;
  tipoConsumo: TipoConsumo;
  analise?: AnaliseConsumo | null;
}

export interface Dica {
  id: number;
  titulo: string;
  descricao: string;
  categoria: 'Agua' | 'Energia' | 'Geral';
  nivelRelevancia: string | null;
  tipoConsumoId: number | null;
  tipoConsumo?: TipoConsumo | null;
}

export interface DashboardData {
  periodo: string;
  totalAguaAtual: number;
  totalEnergiaAtual: number;
  totalAguaAnterior: number;
  totalEnergiaAnterior: number;
  variacaoAgua: number | null;
  variacaoEnergia: number | null;
  valorAguaAtual: number;
  valorEnergiaAtual: number;
  mediaAgua: number | null;
  mediaEnergia: number | null;
  dadosGrafico: GraficoPeriodo[];
  dica: Dica | null;
  totalRegistros: number;
  dataGeracao: string;
}

export interface GraficoPeriodo {
  periodo: string;
  label: string;
  agua: number;
  energia: number;
  valorAgua?: number;
  valorEnergia?: number;
  variacaoAgua?: number | null;
  variacaoEnergia?: number | null;
}

export interface GraficosData {
  dados: GraficoPeriodo[];
  mediaAgua: number | null;
  mediaEnergia: number | null;
  periodos: string[];
}

export interface AuthResponse {
  usuario: Usuario;
  token: string;
}
