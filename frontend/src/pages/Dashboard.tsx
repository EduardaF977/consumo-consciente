import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Droplets, Zap, TrendingUp, TrendingDown, Minus,
  Plus, History, BarChart2, Lightbulb, AlertCircle,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { dashboardService } from '../services/dashboard.service';
import { DashboardData } from '../types';
import { formatarNumero, formatarMoeda, formatarPeriodo, periodoAtual } from '../utils/formatters';
import { useAuth } from '../contexts/AuthContext';

function VariacaoIndicador({ valor }: { valor: number | null }) {
  if (valor === null) return <span className="stat-card-change neutral"><Minus size={13} /> Sem dados anteriores</span>;
  if (valor > 0) return <span className="stat-card-change up"><TrendingUp size={13} /> +{formatarNumero(valor, 1)}% vs mês ant.</span>;
  if (valor < 0) return <span className="stat-card-change down"><TrendingDown size={13} /> {formatarNumero(valor, 1)}% vs mês ant.</span>;
  return <span className="stat-card-change neutral"><Minus size={13} /> Estável</span>;
}

export default function Dashboard() {
  const { usuario } = useAuth();
  const [dados, setDados] = useState<DashboardData | null>(null);
  const [periodo, setPeriodo] = useState(periodoAtual());
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    setCarregando(true);
    setErro('');
    dashboardService.obter(periodo)
      .then(setDados)
      .catch(() => setErro('Não foi possível carregar o dashboard.'))
      .finally(() => setCarregando(false));
  }, [periodo]);

  const semDados = !carregando && dados && dados.totalRegistros === 0;

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="page-title">Olá, {usuario?.nome?.split(' ')[0]} 👋</h1>
            <p className="page-subtitle">Acompanhe seu consumo de água e energia</p>
          </div>
          <Link to="/novo-consumo" className="btn btn-primary">
            <Plus size={16} /> Novo Consumo
          </Link>
        </div>
      </div>

      <div className="page-content">
        {/* Seletor de período */}
        <div className="period-select" style={{ marginBottom: 20 }}>
          <label htmlFor="periodo">Período:</label>
          <input
            id="periodo"
            type="month"
            className="form-control"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            style={{ width: 'auto' }}
          />
          {dados && <span style={{ fontSize: 13, color: 'var(--color-gray-500)' }}>{formatarPeriodo(periodo)}</span>}
        </div>

        {erro && (
          <div className="alert alert-error">
            <AlertCircle size={16} /> {erro}
          </div>
        )}

        {carregando && (
          <div className="loading-page">
            <span className="loading-spinner dark" /> Carregando dashboard...
          </div>
        )}

        {/* Estado vazio */}
        {semDados && (
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="empty-state">
              <div className="empty-state-icon">💧</div>
              <div className="empty-state-title">Nenhum registro ainda</div>
              <div className="empty-state-text">
                Comece registrando seu consumo de água ou energia para visualizar os indicadores e acompanhar sua evolução.
              </div>
              <Link to="/novo-consumo" className="btn btn-primary" style={{ marginTop: 8 }}>
                <Plus size={16} /> Registrar primeiro consumo
              </Link>
            </div>
          </div>
        )}

        {/* Cards de indicadores */}
        {!carregando && dados && (
          <>
            <div className="stats-grid">
              {/* Água */}
              <div className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-label">Água</span>
                  <div className="stat-card-icon water"><Droplets size={18} /></div>
                </div>
                <div>
                  <span className="stat-card-value">{formatarNumero(dados.totalAguaAtual)}</span>
                  <span className="stat-card-unit"> m³</span>
                </div>
                <VariacaoIndicador valor={dados.variacaoAgua} />
                {dados.valorAguaAtual > 0 && (
                  <span style={{ fontSize: 12, color: 'var(--color-gray-500)' }}>
                    {formatarMoeda(dados.valorAguaAtual)} pagos
                  </span>
                )}
              </div>

              {/* Energia */}
              <div className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-label">Energia</span>
                  <div className="stat-card-icon energy"><Zap size={18} /></div>
                </div>
                <div>
                  <span className="stat-card-value">{formatarNumero(dados.totalEnergiaAtual)}</span>
                  <span className="stat-card-unit"> kWh</span>
                </div>
                <VariacaoIndicador valor={dados.variacaoEnergia} />
                {dados.valorEnergiaAtual > 0 && (
                  <span style={{ fontSize: 12, color: 'var(--color-gray-500)' }}>
                    {formatarMoeda(dados.valorEnergiaAtual)} pagos
                  </span>
                )}
              </div>

              {/* Média água */}
              <div className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-label">Média histórica — Água</span>
                  <div className="stat-card-icon water"><Droplets size={18} /></div>
                </div>
                <div>
                  <span className="stat-card-value">
                    {dados.mediaAgua !== null ? formatarNumero(dados.mediaAgua) : '—'}
                  </span>
                  <span className="stat-card-unit"> m³/mês</span>
                </div>
                <span style={{ fontSize: 12, color: 'var(--color-gray-400)' }}>
                  Baseado em todos os registros
                </span>
              </div>

              {/* Média energia */}
              <div className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-label">Média histórica — Energia</span>
                  <div className="stat-card-icon energy"><Zap size={18} /></div>
                </div>
                <div>
                  <span className="stat-card-value">
                    {dados.mediaEnergia !== null ? formatarNumero(dados.mediaEnergia) : '—'}
                  </span>
                  <span className="stat-card-unit"> kWh/mês</span>
                </div>
                <span style={{ fontSize: 12, color: 'var(--color-gray-400)' }}>
                  Baseado em todos os registros
                </span>
              </div>
            </div>

            {/* Gráfico resumido */}
            {dados.dadosGrafico.some((d) => d.agua > 0 || d.energia > 0) ? (
              <div className="card" style={{ marginBottom: 24 }}>
                <div className="chart-header">
                  <span className="chart-title">Evolução dos últimos 6 meses</span>
                  <Link to="/graficos" style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 600 }}>
                    Ver completo →
                  </Link>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={dados.dadosGrafico} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-100)" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        `${formatarNumero(value)} ${name === 'agua' ? 'm³' : 'kWh'}`,
                        name === 'agua' ? 'Água' : 'Energia',
                      ]}
                    />
                    <Legend formatter={(v) => (v === 'agua' ? 'Água (m³)' : 'Energia (kWh)')} />
                    <Area type="monotone" dataKey="agua" stroke="var(--color-water)" fill="var(--color-water-light)" strokeWidth={2} dot={false} />
                    <Area type="monotone" dataKey="energia" stroke="var(--color-energy)" fill="var(--color-energy-light)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              !semDados && (
                <div className="card" style={{ marginBottom: 24 }}>
                  <p style={{ fontSize: 14, color: 'var(--color-gray-500)', textAlign: 'center', padding: '20px 0' }}>
                    Sem dados suficientes para exibir o gráfico de evolução.
                  </p>
                </div>
              )
            )}

            {/* Dica do dia */}
            {dados.dica && (
              <div className="card" style={{ marginBottom: 24, borderLeft: '4px solid var(--color-primary)' }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ fontSize: 24 }}>💡</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-primary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Dica de consumo consciente
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 6 }}>
                      {dados.dica.titulo}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--color-gray-600)', lineHeight: 1.6 }}>
                      {dados.dica.descricao}
                    </div>
                    <Link to="/dicas" style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 600, display: 'inline-block', marginTop: 8 }}>
                      Ver todas as dicas →
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Acesso rápido */}
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-gray-600)', marginBottom: 12 }}>Acesso rápido</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                <Link to="/novo-consumo" className="btn btn-primary"><Plus size={16} />Novo consumo</Link>
                <Link to="/historico" className="btn btn-outline"><History size={16} />Histórico</Link>
                <Link to="/graficos" className="btn btn-outline"><BarChart2 size={16} />Gráficos</Link>
                <Link to="/dicas" className="btn btn-outline"><Lightbulb size={16} />Dicas</Link>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
