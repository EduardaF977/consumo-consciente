import api from './api';
import { GraficosData } from '../types';

export const graficosService = {
  async obter(meses?: number): Promise<GraficosData> {
    const { data } = await api.get<GraficosData>('/graficos', { params: { meses } });
    return data;
  },
};
