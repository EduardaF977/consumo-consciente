import api from './api';
import { AuthResponse } from '../types';

export const authService = {
  async registrar(nome: string, email: string, senha: string, confirmacaoSenha: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/registrar', { nome, email, senha, confirmacaoSenha });
    return data;
  },

  async login(email: string, senha: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, senha });
    return data;
  },
};
