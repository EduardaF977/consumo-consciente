import api from './api';
import { Dica } from '../types';

export const dicasService = {
  async listar(categoria?: string): Promise<Dica[]> {
    const { data } = await api.get<Dica[]>('/dicas', { params: { categoria } });
    return data;
  },
};
