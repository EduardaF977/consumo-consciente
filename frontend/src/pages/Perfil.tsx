import { useEffect, useState, FormEvent } from 'react';
import { AlertCircle, CheckCircle2, User, Mail, Lock, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { perfilService } from '../services/perfil.service';
import { useAuth } from '../contexts/AuthContext';
import { formatarData } from '../utils/formatters';

export default function Perfil() {
  const { usuario, logout, atualizarUsuario } = useAuth();
  const navigate = useNavigate();

  // Dados do perfil
  const [nome, setNome] = useState(usuario?.nome || '');
  const [email, setEmail] = useState(usuario?.email || '');
  const [totalConsumos, setTotalConsumos] = useState<number | null>(null);
  const [salvandoPerfil, setSalvandoPerfil] = useState(false);
  const [erroPerfil, setErroPerfil] = useState('');
  const [sucessoPerfil, setSucessoPerfil] = useState('');

  // Senha
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacaoNovaSenha, setConfirmacaoNovaSenha] = useState('');
  const [salvandoSenha, setSalvandoSenha] = useState(false);
  const [erroSenha, setErroSenha] = useState('');
  const [sucessoSenha, setSucessoSenha] = useState('');

  useEffect(() => {
    perfilService.obter()
      .then((dados) => {
        setNome(dados.nome);
        setEmail(dados.email);
        setTotalConsumos(dados.totalConsumos);
      })
      .catch(() => {});
  }, []);

  async function handleSalvarPerfil(e: FormEvent) {
    e.preventDefault();
    setErroPerfil('');
    setSucessoPerfil('');

    if (!nome.trim()) { setErroPerfil('O nome não pode ser vazio.'); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { setErroPerfil('Formato de e-mail inválido.'); return; }

    setSalvandoPerfil(true);
    try {
      const atualizado = await perfilService.atualizar({ nome, email });
      atualizarUsuario(atualizado);
      setSucessoPerfil('Perfil atualizado com sucesso!');
      setTimeout(() => setSucessoPerfil(''), 3500);
    } catch (err: unknown) {
      setErroPerfil(
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Erro ao atualizar perfil.'
      );
    } finally {
      setSalvandoPerfil(false);
    }
  }

  async function handleAlterarSenha(e: FormEvent) {
    e.preventDefault();
    setErroSenha('');
    setSucessoSenha('');

    if (!senhaAtual || !novaSenha || !confirmacaoNovaSenha) {
      setErroSenha('Preencha todos os campos de senha.');
      return;
    }
    if (novaSenha.length < 6) { setErroSenha('A nova senha deve ter no mínimo 6 caracteres.'); return; }
    if (novaSenha !== confirmacaoNovaSenha) { setErroSenha('A nova senha e a confirmação não coincidem.'); return; }

    setSalvandoSenha(true);
    try {
      await perfilService.alterarSenha(senhaAtual, novaSenha, confirmacaoNovaSenha);
      setSucessoSenha('Senha alterada com sucesso!');
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmacaoNovaSenha('');
      setTimeout(() => setSucessoSenha(''), 3500);
    } catch (err: unknown) {
      setErroSenha(
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Erro ao alterar senha.'
      );
    } finally {
      setSalvandoSenha(false);
    }
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Perfil</h1>
        <p className="page-subtitle">Gerencie suas informações e configurações de conta</p>
      </div>

      <div className="page-content">
        <div style={{ maxWidth: 620 }}>
          {/* Resumo da conta */}
          <div className="card" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 60, height: 60, borderRadius: '50%',
              background: 'var(--color-primary-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, color: 'var(--color-primary)', fontWeight: 700, flexShrink: 0,
            }}>
              {usuario?.nome?.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-gray-900)' }}>{usuario?.nome}</div>
              <div style={{ fontSize: 13, color: 'var(--color-gray-500)' }}>{usuario?.email}</div>
              {usuario?.dataCadastro && (
                <div style={{ fontSize: 12, color: 'var(--color-gray-400)', marginTop: 4 }}>
                  Membro desde {formatarData(usuario.dataCadastro)}
                  {totalConsumos !== null && ` · ${totalConsumos} registro${totalConsumos !== 1 ? 's' : ''}`}
                </div>
              )}
            </div>
          </div>

          {/* Editar dados */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <User size={18} color="var(--color-primary)" />
              <span style={{ fontWeight: 700, fontSize: 15 }}>Dados da conta</span>
            </div>

            {erroPerfil && <div className="alert alert-error"><AlertCircle size={16} />{erroPerfil}</div>}
            {sucessoPerfil && <div className="alert alert-success"><CheckCircle2 size={16} />{sucessoPerfil}</div>}

            <form onSubmit={handleSalvarPerfil} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="nome">
                  <User size={13} style={{ marginRight: 4 }} />
                  Nome completo
                </label>
                <input
                  id="nome"
                  type="text"
                  className="form-control"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  autoComplete="name"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="email-perfil">
                  <Mail size={13} style={{ marginRight: 4 }} />
                  E-mail
                </label>
                <input
                  id="email-perfil"
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={salvandoPerfil}>
                {salvandoPerfil ? <><span className="loading-spinner" />Salvando...</> : <><CheckCircle2 size={16} />Salvar alterações</>}
              </button>
            </form>
          </div>

          {/* Alterar senha */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Lock size={18} color="var(--color-primary)" />
              <span style={{ fontWeight: 700, fontSize: 15 }}>Alterar senha</span>
            </div>

            {erroSenha && <div className="alert alert-error"><AlertCircle size={16} />{erroSenha}</div>}
            {sucessoSenha && <div className="alert alert-success"><CheckCircle2 size={16} />{sucessoSenha}</div>}

            <form onSubmit={handleAlterarSenha} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="senha-atual">Senha atual</label>
                <input
                  id="senha-atual"
                  type="password"
                  className="form-control"
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                  autoComplete="current-password"
                  placeholder="Digite sua senha atual"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="nova-senha">Nova senha</label>
                <input
                  id="nova-senha"
                  type="password"
                  className="form-control"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  autoComplete="new-password"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="confirmar-nova-senha">Confirmar nova senha</label>
                <input
                  id="confirmar-nova-senha"
                  type="password"
                  className="form-control"
                  value={confirmacaoNovaSenha}
                  onChange={(e) => setConfirmacaoNovaSenha(e.target.value)}
                  autoComplete="new-password"
                  placeholder="Repita a nova senha"
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={salvandoSenha}>
                {salvandoSenha ? <><span className="loading-spinner" />Alterando...</> : <><Lock size={16} />Alterar senha</>}
              </button>
            </form>
          </div>

          {/* Sair */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <LogOut size={18} color="var(--color-danger)" />
              <span style={{ fontWeight: 700, fontSize: 15 }}>Encerrar sessão</span>
            </div>
            <p style={{ fontSize: 14, color: 'var(--color-gray-500)', marginBottom: 14 }}>
              Ao sair, você precisará fazer login novamente para acessar a plataforma.
            </p>
            <button className="btn btn-danger" onClick={handleLogout}>
              <LogOut size={16} /> Sair da conta
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
