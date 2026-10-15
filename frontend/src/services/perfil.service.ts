import api from './api';
import { Usuario } from '../types';

interface PerfilCompleto extends Usuario {
  totalConsumos: number;
}

export const perfilService = {
  async obter(): Promise<PerfilCompleto> {
    const { data } = await api.get<PerfilCompleto>('/perfil');
    return data;
  },

  async atualizar(dados: { nome?: string; email?: string }): Promise<Usuario> {
    const { data } = await api.put<Usuario>('/perfil', dados);
    return data;
  },

  async alterarSenha(senhaAtual: string, novaSenha: string, confirmacaoNovaSenha: string): Promise<void> {
    await api.put('/perfil/senha', { senhaAtual, novaSenha, confirmacaoNovaSenha });
  },
};
