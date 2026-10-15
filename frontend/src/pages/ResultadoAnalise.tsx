import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, Minus, Droplets, Zap,
  CheckCircle2, AlertTriangle, AlertCircle, History, Plus,
} from 'lucide-react';
import { consumoService } from '../services/consumo.service';
import { Consumo } from '../types';
import { formatarNumero, formatarMoeda, formatarPeriodo } from '../utils/formatters';

function IconeVariacao({ variacao }: { variacao: number | null }) {
  if (variacao === null) return <Minus size={20} />;
  if (variacao > 0) return <TrendingUp size={20} />;
  if (variacao < 0) return <TrendingDown size={20} />;
  return <Minus size={20} />;
}

function corClassificacao(classificacao: string | null | undefined): string {
  if (!classificacao) return 'var(--color-gray-500)';
  if (classificacao.startsWith('Excelente')) return 'var(--color-success)';
  if (classificacao.startsWith('Bom')) return '#0891b2';
  if (classificacao.startsWith('Estável')) return 'var(--color-gray-600)';
  if (classificacao.startsWith('Atenção')) return 'var(--color-warning)';
  if (classificacao.startsWith('Crítico')) return 'var(--color-danger)';
  return 'var(--color-gray-600)';
}

function iconeClassificacao(classificacao: string | null | undefined) {
  if (!classificacao) return <Minus size={24} />;
  if (classificacao.startsWith('Excelente') || classificacao.startsWith('Bom'))
    return <CheckCircle2 size={24} />;
  if (classificacao.startsWith('Atenção') || classificacao.startsWith('Crítico'))
    return <AlertTriangle size={24} />;
  return <Minus size={24} />;
}

export default function ResultadoAnalise() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [consumo, setConsumo] = useState<Consumo | null>(
    (location.state as { consumo?: Consumo })?.consumo || null
  );
  const [carregando, setCarregando] = useState(!consumo);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!consumo && id) {
      setCarregando(true);
      consumoService.obter(parseInt(id))
        .then(setConsumo)
        .catch(() => setErro('Registro não encontrado.'))
        .finally(() => setCarregando(false));
    }
  }, [id, consumo]);

  if (carregando) {
    return (
      <div className="loading-page">
        <span className="loading-spinner dark" /> Carregando análise...
      </div>
    );
  }

  if (erro || !consumo) {
    return (
      <div className="page-content">
        <div className="alert alert-error"><AlertCircle size={16} />{erro || 'Registro não encontrado.'}</div>
        <Link to="/historico" className="btn btn-outline"><History size={16} />Ver histórico</Link>
      </div>
    );
  }

  const { analise, tipoConsumo } = consumo;
  const isAgua = tipoConsumo.nome === 'Água';
  const cor = isAgua ? 'var(--color-water)' : 'var(--color-energy)';
  const bgCor = isAgua ? 'var(--color-water-light)' : 'var(--color-energy-light)';
  const corClass = corClassificacao(analise?.classificacao);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Resultado do Registro</h1>
        <p className="page-subtitle">Análise do consumo registrado</p>
      </div>

      <div className="page-content">
        <div style={{ maxWidth: 620 }}>
          {/* Card principal */}
          <div className="card" style={{ marginBottom: 20, borderTop: `4px solid ${cor}` }}>
            {/* Cabeçalho */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--color-gray-100)' }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: bgCor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cor }}>
                {isAgua ? <Droplets size={26} /> : <Zap size={26} />}
              </div>
              <div>
                <div style={{ fontSize: 13, color: 'var(--color-gray-500)', marginBottom: 2 }}>
                  {tipoConsumo.nome} · {formatarPeriodo(consumo.periodo)}
                </div>
                <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-gray-900)' }}>
                  {formatarNumero(consumo.quantidade)} <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--color-gray-500)' }}>{tipoConsumo.unidadeMedida}</span>
                </div>
                {consumo.valorPago !== null && (
                  <div style={{ fontSize: 14, color: 'var(--color-gray-500)', marginTop: 2 }}>
                    Valor pago: <strong>{formatarMoeda(consumo.valorPago)}</strong>
                  </div>
                )}
              </div>
            </div>

            {analise ? (
              <>
                {/* Classificação */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 16px', borderRadius: 'var(--radius-md)',
                  background: `${corClass}15`, marginBottom: 16,
                }}>
                  <span style={{ color: corClass }}>{iconeClassificacao(analise.classificacao)}</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: corClass }}>
                    {analise.classificacao || 'Sem classificação'}
                  </span>
                </div>

                {/* Métricas */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div style={{ padding: 14, background: 'var(--color-gray-50)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: 12, color: 'var(--color-gray-500)', marginBottom: 4 }}>Média histórica</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-gray-800)' }}>
                      {analise.mediaConsumo !== null
                        ? `${formatarNumero(analise.mediaConsumo)} ${tipoConsumo.unidadeMedida}`
                        : '—'}
                    </div>
                  </div>

                  <div style={{ padding: 14, background: 'var(--color-gray-50)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: 12, color: 'var(--color-gray-500)', marginBottom: 4 }}>Variação vs mês ant.</div>
                    <div style={{
                      fontSize: 18, fontWeight: 700,
                      color: analise.variacaoConsumo === null ? 'var(--color-gray-500)'
                        : analise.variacaoConsumo > 0 ? 'var(--color-danger)'
                        : analise.variacaoConsumo < 0 ? 'var(--color-success)'
                        : 'var(--color-gray-600)',
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                      <IconeVariacao variacao={analise.variacaoConsumo} />
                      {analise.variacaoConsumo !== null
                        ? `${analise.variacaoConsumo > 0 ? '+' : ''}${formatarNumero(analise.variacaoConsumo, 1)}%`
                        : 'Sem dados'}
                    </div>
                  </div>
                </div>

                {/* Observação */}
                <div style={{
                  padding: 16, background: 'var(--color-gray-50)',
                  borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--color-gray-300)',
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-gray-500)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Observação
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--color-gray-700)', lineHeight: 1.7 }}>
                    {analise.observacao}
                  </p>
                </div>
              </>
            ) : (
              <div style={{ fontSize: 14, color: 'var(--color-gray-500)' }}>
                Análise não disponível para este registro.
              </div>
            )}
          </div>

          {/* Ações */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <button className="btn btn-primary" onClick={() => navigate('/novo-consumo')}>
              <Plus size={16} /> Registrar outro
            </button>
            <Link to="/historico" className="btn btn-outline">
              <History size={16} /> Ver histórico
            </Link>
            <Link to="/dashboard" className="btn btn-outline">
              Ver dashboard
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
