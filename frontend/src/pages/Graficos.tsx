import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts';
import { graficosService } from '../services/graficos.service';
import { GraficosData } from '../types';
import { formatarNumero } from '../utils/formatters';

const OPCOES_MESES = [
  { label: 'Últimos 3 meses', value: 3 },
  { label: 'Últimos 6 meses', value: 6 },
  { label: 'Últimos 12 meses', value: 12 },
];

export default function Graficos() {
  const [dados, setDados] = useState<GraficosData | null>(null);
  const [meses, setMeses] = useState(12);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    setCarregando(true);
    setErro('');
    graficosService.obter(meses)
      .then(setDados)
      .catch(() => setErro('Não foi possível carregar os gráficos.'))
      .finally(() => setCarregando(false));
  }, [meses]);

  const temDadosAgua = dados?.dados.some((d) => d.agua > 0);
  const temDadosEnergia = dados?.dados.some((d) => d.energia > 0);

  const TooltipAgua = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'white', border: '1px solid var(--color-gray-200)', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
          <div style={{ color: 'var(--color-water)' }}>Água: {formatarNumero(payload[0]?.value)} m³</div>
        </div>
      );
    }
    return null;
  };

  const TooltipEnergia = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'white', border: '1px solid var(--color-gray-200)', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
          <div style={{ color: 'var(--color-energy)' }}>Energia: {formatarNumero(payload[0]?.value)} kWh</div>
        </div>
      );
    }
    return null;
  };

  const TooltipValores = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'white', border: '1px solid var(--color-gray-200)', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
          {payload.map((p, i) => (
            <div key={i} style={{ color: p.color }}>
              {p.name}: R$ {formatarNumero(p.value)}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="page-title">Gráficos e Indicadores</h1>
            <p className="page-subtitle">Visualize a evolução do seu consumo ao longo do tempo</p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {OPCOES_MESES.map((op) => (
              <button
                key={op.value}
                className={`filter-chip ${meses === op.value ? 'active' : ''}`}
                onClick={() => setMeses(op.value)}
              >
                {op.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="page-content">
        {erro && <div className="alert alert-error"><AlertCircle size={16} />{erro}</div>}

        {carregando && (
          <div className="loading-page"><span className="loading-spinner dark" />Carregando gráficos...</div>
        )}

        {!carregando && dados && (
          <>
            {/* Médias */}
            <div className="stats-grid" style={{ marginBottom: 24 }}>
              <div className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-label">Média — Água</span>
                  <span style={{ fontSize: 20 }}>💧</span>
                </div>
                <div>
                  <span className="stat-card-value">
                    {dados.mediaAgua !== null ? formatarNumero(dados.mediaAgua) : '—'}
                  </span>
                  <span className="stat-card-unit"> m³/mês</span>
                </div>
                <span style={{ fontSize: 12, color: 'var(--color-gray-400)' }}>
                  Nos {meses} meses selecionados
                </span>
              </div>
              <div className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-label">Média — Energia</span>
                  <span style={{ fontSize: 20 }}>⚡</span>
                </div>
                <div>
                  <span className="stat-card-value">
                    {dados.mediaEnergia !== null ? formatarNumero(dados.mediaEnergia) : '—'}
                  </span>
                  <span className="stat-card-unit"> kWh/mês</span>
                </div>
                <span style={{ fontSize: 12, color: 'var(--color-gray-400)' }}>
                  Nos {meses} meses selecionados
                </span>
              </div>
            </div>

            {/* Gráfico Água */}
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="chart-header">
                <span className="chart-title">💧 Consumo de Água (m³)</span>
              </div>
              {!temDadosAgua ? (
                <div className="empty-state" style={{ padding: '30px 0' }}>
                  <div className="empty-state-text">Nenhum registro de água no período selecionado.</div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={dados.dados} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-100)" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} unit=" m³" width={60} />
                    <Tooltip content={<TooltipAgua />} />
                    {dados.mediaAgua !== null && (
                      <ReferenceLine y={dados.mediaAgua} stroke="var(--color-water)" strokeDasharray="6 3" label={{ value: 'Média', position: 'right', fontSize: 11, fill: 'var(--color-water)' }} />
                    )}
                    <Line type="monotone" dataKey="agua" stroke="var(--color-water)" strokeWidth={2.5} dot={{ r: 4, fill: 'var(--color-water)' }} activeDot={{ r: 6 }} name="Água (m³)" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Gráfico Energia */}
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="chart-header">
                <span className="chart-title">⚡ Consumo de Energia (kWh)</span>
              </div>
              {!temDadosEnergia ? (
                <div className="empty-state" style={{ padding: '30px 0' }}>
                  <div className="empty-state-text">Nenhum registro de energia no período selecionado.</div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={dados.dados} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-100)" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} unit=" kWh" width={65} />
                    <Tooltip content={<TooltipEnergia />} />
                    {dados.mediaEnergia !== null && (
                      <ReferenceLine y={dados.mediaEnergia} stroke="var(--color-energy)" strokeDasharray="6 3" label={{ value: 'Média', position: 'right', fontSize: 11, fill: 'var(--color-energy)' }} />
                    )}
                    <Line type="monotone" dataKey="energia" stroke="var(--color-energy)" strokeWidth={2.5} dot={{ r: 4, fill: 'var(--color-energy)' }} activeDot={{ r: 6 }} name="Energia (kWh)" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Gráfico Valores */}
            {dados.dados.some((d) => (d.valorAgua ?? 0) > 0 || (d.valorEnergia ?? 0) > 0) && (
              <div className="card" style={{ marginBottom: 20 }}>
                <div className="chart-header">
                  <span className="chart-title">💰 Valores Pagos por Período (R$)</span>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={dados.dados} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-100)" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} unit=" R$" width={70} />
                    <Tooltip content={<TooltipValores />} />
                    <Legend formatter={(v) => (v === 'valorAgua' ? 'Água (R$)' : 'Energia (R$)')} />
                    <Bar dataKey="valorAgua" fill="var(--color-water)" name="Água (R$)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="valorEnergia" fill="var(--color-energy)" name="Energia (R$)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Variações */}
            {(temDadosAgua || temDadosEnergia) && (
              <div className="card">
                <div className="chart-header">
                  <span className="chart-title">📊 Variação Percentual Mês a Mês (%)</span>
                </div>
                {dados.dados.every((d) => d.variacaoAgua === null && d.variacaoEnergia === null) ? (
                  <div className="empty-state" style={{ padding: '20px 0' }}>
                    <div className="empty-state-text">Dados insuficientes para calcular variações. Registre consumos em meses consecutivos.</div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={dados.dados} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-100)" />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} unit="%" />
                      <Tooltip formatter={(v: number) => [`${formatarNumero(v, 1)}%`]} />
                      <Legend formatter={(v) => (v === 'variacaoAgua' ? 'Água (%)' : 'Energia (%)')} />
                      <ReferenceLine y={0} stroke="var(--color-gray-400)" />
                      <Bar dataKey="variacaoAgua" fill="var(--color-water)" name="Água (%)" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="variacaoEnergia" fill="var(--color-energy)" name="Energia (%)" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
