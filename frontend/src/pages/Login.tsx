import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro('');

    if (!email || !senha) {
      setErro('Preencha e-mail e senha.');
      return;
    }

    setCarregando(true);
    try {
      await login(email, senha);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Falha ao entrar. Verifique suas credenciais.';
      setErro(msg);
    } finally {
      setCarregando(false);
    }
  }

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

        <h1 className="auth-title">Entrar na conta</h1>
        <p className="auth-subtitle">Bem-vindo de volta! Informe seus dados para continuar.</p>

        {erro && (
          <div className="alert alert-error" role="alert">
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              className="form-control"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="senha">Senha</label>
            <div style={{ position: 'relative' }}>
              <input
                id="senha"
                type={mostrarSenha ? 'text' : 'password'}
                className="form-control"
                placeholder="Sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                autoComplete="current-password"
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
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={carregando}
            style={{ marginTop: 8 }}
          >
            {carregando ? <><span className="loading-spinner" /> Entrando...</> : 'Entrar'}
          </button>
        </form>

        <div className="auth-footer">
          Não tem conta?{' '}
          <Link to="/cadastro">Criar conta gratuita</Link>
        </div>

        <div style={{
          marginTop: 20, padding: 14,
          background: 'var(--color-gray-50)', borderRadius: 'var(--radius-md)',
          fontSize: 13, color: 'var(--color-gray-500)',
        }}>
          <strong>Conta demo:</strong><br />
          demo@consumoconsciente.com / Demo@1234
        </div>
      </div>
    </div>
  );
}
