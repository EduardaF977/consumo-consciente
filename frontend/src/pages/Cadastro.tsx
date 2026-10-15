import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Erros {
  nome?: string;
  email?: string;
  senha?: string;
  confirmacaoSenha?: string;
}

export default function Cadastro() {
  const { registrar } = useAuth();
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacaoSenha, setConfirmacaoSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erros, setErros] = useState<Erros>({});
  const [erroGeral, setErroGeral] = useState('');
  const [carregando, setCarregando] = useState(false);

  function validar(): boolean {
    const novosErros: Erros = {};

    if (!nome.trim()) novosErros.nome = 'Nome é obrigatório.';
    else if (nome.trim().length < 3) novosErros.nome = 'Nome deve ter pelo menos 3 caracteres.';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) novosErros.email = 'E-mail é obrigatório.';
    else if (!emailRegex.test(email)) novosErros.email = 'Formato de e-mail inválido.';

    if (!senha) novosErros.senha = 'Senha é obrigatória.';
    else if (senha.length < 6) novosErros.senha = 'Mínimo de 6 caracteres.';

    if (!confirmacaoSenha) novosErros.confirmacaoSenha = 'Confirme a senha.';
    else if (senha !== confirmacaoSenha) novosErros.confirmacaoSenha = 'As senhas não coincidem.';

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErroGeral('');

    if (!validar()) return;

    setCarregando(true);
    try {
      await registrar(nome, email, senha, confirmacaoSenha);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Erro ao criar conta. Tente novamente.';
      setErroGeral(msg);
    } finally {
      setCarregando(false);
    }
  }

  const senhaForte = senha.length >= 8 && /[A-Z]/.test(senha) && /[0-9]/.test(senha);
  const senhaMed = senha.length >= 6 && !senhaForte;

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">🌿</div>
          <div>
            <div className="auth-logo-text">Consumo Consciente</div>
            <div className="auth-logo-sub">Monitore água e energia</div>
          </div>
        </div>

        <h1 className="auth-title">Criar conta</h1>
        <p className="auth-subtitle">Preencha os dados abaixo para começar.</p>

        {erroGeral && (
          <div className="alert alert-error" role="alert">
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            {erroGeral}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="nome">Nome completo</label>
            <input
              id="nome"
              type="text"
              className={`form-control ${erros.nome ? 'error' : ''}`}
              placeholder="Seu nome"
              value={nome}
              onChange={(e) => { setNome(e.target.value); setErros((p) => ({ ...p, nome: '' })); }}
              autoComplete="name"
              autoFocus
            />
            {erros.nome && (
              <span className="form-error"><AlertCircle size={13} />{erros.nome}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              className={`form-control ${erros.email ? 'error' : ''}`}
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErros((p) => ({ ...p, email: '' })); }}
              autoComplete="email"
            />
            {erros.email && (
              <span className="form-error"><AlertCircle size={13} />{erros.email}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="senha">Senha</label>
            <div style={{ position: 'relative' }}>
              <input
                id="senha"
                type={mostrarSenha ? 'text' : 'password'}
                className={`form-control ${erros.senha ? 'error' : ''}`}
                placeholder="Mínimo 6 caracteres"
                value={senha}
                onChange={(e) => { setSenha(e.target.value); setErros((p) => ({ ...p, senha: '' })); }}
                autoComplete="new-password"
                style={{ paddingRight: 42 }}
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                style={{
                  position: 'absolute', right: 12, top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', color: 'var(--color-gray-400)', cursor: 'pointer', padding: 0,
                }}
              >
                {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {erros.senha && (
              <span className="form-error"><AlertCircle size={13} />{erros.senha}</span>
            )}
            {senha && !erros.senha && (
              <span className="form-hint" style={{ color: senhaForte ? 'var(--color-success)' : senhaMed ? 'var(--color-warning)' : 'var(--color-danger)' }}>
                Força: {senhaForte ? 'Forte ✓' : senhaMed ? 'Média' : 'Fraca'}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmacaoSenha">Confirmar senha</label>
            <input
              id="confirmacaoSenha"
              type={mostrarSenha ? 'text' : 'password'}
              className={`form-control ${erros.confirmacaoSenha ? 'error' : ''}`}
              placeholder="Repita a senha"
              value={confirmacaoSenha}
              onChange={(e) => { setConfirmacaoSenha(e.target.value); setErros((p) => ({ ...p, confirmacaoSenha: '' })); }}
              autoComplete="new-password"
            />
            {erros.confirmacaoSenha && (
              <span className="form-error"><AlertCircle size={13} />{erros.confirmacaoSenha}</span>
            )}
            {confirmacaoSenha && senha === confirmacaoSenha && (
              <span className="form-hint" style={{ color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle2 size={13} /> Senhas coincidem
              </span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={carregando}
            style={{ marginTop: 8 }}
          >
            {carregando ? <><span className="loading-spinner" /> Criando conta...</> : 'Criar conta'}
          </button>
        </form>

        <div className="auth-footer">
          Já tem conta?{' '}
          <Link to="/login">Entrar</Link>
        </div>
      </div>
    </div>
  );
}
