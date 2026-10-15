import api from './api';
import { Consumo, TipoConsumo } from '../types';

interface FiltrosConsumo {
  tipo?: string;
  periodoInicio?: string;
  periodoFim?: string;
}

interface CriarConsumoData {
  tipoConsumoId: number;
  quantidade: number;
  periodo: string;
  valorPago?: number | null;
}

export const consumoService = {
  async listar(filtros?: FiltrosConsumo): Promise<Consumo[]> {
    const { data } = await api.get<Consumo[]>('/consumos', { params: filtros });
    return data;
  },

  async obter(id: number): Promise<Consumo> {
    const { data } = await api.get<Consumo>(`/consumos/${id}`);
    return data;
  },

  async criar(dados: CriarConsumoData): Promise<{ consumo: Consumo }> {
    const { data } = await api.post<{ consumo: Consumo }>('/consumos', dados);
    return data;
  },

  async atualizar(id: number, dados: Partial<CriarConsumoData>): Promise<Consumo> {
    const { data } = await api.put<Consumo>(`/consumos/${id}`, dados);
    return data;
  },

  async deletar(id: number): Promise<void> {
    await api.delete(`/consumos/${id}`);
  },

  async listarTipos(): Promise<TipoConsumo[]> {
    const { data } = await api.get<TipoConsumo[]>('/consumos/tipos');
    return data;
  },
};
