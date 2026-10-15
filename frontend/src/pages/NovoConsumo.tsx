import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Droplets, Zap, CheckCircle2 } from 'lucide-react';
import { consumoService } from '../services/consumo.service';
import { TipoConsumo } from '../types';
import { periodoAtual } from '../utils/formatters';

interface Erros {
  tipoConsumoId?: string;
  quantidade?: string;
  periodo?: string;
  valorPago?: string;
}

export default function NovoConsumo() {
  const navigate = useNavigate();
  const [tipos, setTipos] = useState<TipoConsumo[]>([]);
  const [tipoConsumoId, setTipoConsumoId] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [periodo, setPeriodo] = useState(periodoAtual());
  const [valorPago, setValorPago] = useState('');
  const [erros, setErros] = useState<Erros>({});
  const [erroGeral, setErroGeral] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [carregandoTipos, setCarregandoTipos] = useState(true);

  useEffect(() => {
    consumoService.listarTipos()
      .then(setTipos)
      .catch(() => setErroGeral('Erro ao carregar tipos de consumo.'))
      .finally(() => setCarregandoTipos(false));
  }, []);

  const tipoSelecionado = tipos.find((t) => t.id === parseInt(tipoConsumoId));

  function validar(): boolean {
    const novosErros: Erros = {};

    if (!tipoConsumoId) novosErros.tipoConsumoId = 'Selecione o tipo de consumo.';

    if (!quantidade) {
      novosErros.quantidade = 'Quantidade é obrigatória.';
    } else if (parseFloat(quantidade) < 0) {
      novosErros.quantidade = 'A quantidade não pode ser negativa.';
    } else if (isNaN(parseFloat(quantidade))) {
      novosErros.quantidade = 'Informe um número válido.';
    }

    if (!periodo) {
      novosErros.periodo = 'Período é obrigatório.';
    } else {
      const [ano] = periodo.split('-').map(Number);
      if (ano < 2000 || ano > new Date().getFullYear() + 1) {
        novosErros.periodo = 'Período fora do intervalo permitido.';
      }
    }

    if (valorPago && parseFloat(valorPago) < 0) {
      novosErros.valorPago = 'O valor não pode ser negativo.';
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErroGeral('');

    if (!validar()) return;

    setCarregando(true);
    try {
      const resultado = await consumoService.criar({
        tipoConsumoId: parseInt(tipoConsumoId),
        quantidade: parseFloat(quantidade),
        periodo,
        valorPago: valorPago ? parseFloat(valorPago) : null,
      });
      navigate(`/resultado/${resultado.consumo.id}`, {
        state: { consumo: resultado.consumo },
      });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Erro ao registrar consumo.';
      setErroGeral(msg);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Novo Consumo</h1>
        <p className="page-subtitle">Registre seu consumo de água ou energia elétrica</p>
      </div>

      <div className="page-content">
        <div style={{ maxWidth: 560 }}>
          {erroGeral && (
            <div className="alert alert-error">
              <AlertCircle size={16} /> {erroGeral}
            </div>
          )}

          {/* Seleção de tipo */}
          <div style={{ marginBottom: 24 }}>
            <div className="form-label" style={{ marginBottom: 10 }}>Tipo de consumo</div>
            <div style={{ display: 'flex', gap: 12 }}>
              {carregandoTipos ? (
                <span className="loading-spinner dark" />
              ) : (
                tipos.map((tipo) => {
                  const isAgua = tipo.nome === 'Água';
                  const selected = tipoConsumoId === String(tipo.id);
                  return (
                    <button
                      key={tipo.id}
                      type="button"
                      onClick={() => {
                        setTipoConsumoId(String(tipo.id));
                        setErros((p) => ({ ...p, tipoConsumoId: '' }));
                      }}
                      style={{
                        flex: 1,
                        padding: '16px 12px',
                        borderRadius: 'var(--radius-lg)',
                        border: `2px solid ${selected ? (isAgua ? 'var(--color-water)' : 'var(--color-energy)') : 'var(--color-gray-200)'}`,
                        background: selected ? (isAgua ? 'var(--color-water-light)' : 'var(--color-energy-light)') : 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 8,
                        transition: 'all 0.15s',
                      }}
                    >
                      {isAgua
                        ? <Droplets size={28} color={selected ? 'var(--color-water)' : 'var(--color-gray-400)'} />
                        : <Zap size={28} color={selected ? 'var(--color-energy)' : 'var(--color-gray-400)'} />
                      }
                      <span style={{
                        fontWeight: 700,
                        fontSize: 15,
                        color: selected ? (isAgua ? 'var(--color-water)' : 'var(--color-energy)') : 'var(--color-gray-600)',
                      }}>
                        {tipo.nome}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--color-gray-400)' }}>
                        {tipo.unidadeMedida}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
            {erros.tipoConsumoId && (
              <span className="form-error" style={{ marginTop: 6 }}>
                <AlertCircle size={13} />{erros.tipoConsumoId}
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="quantidade">
                Quantidade consumida
                {tipoSelecionado && (
                  <span style={{
                    marginLeft: 8, fontSize: 12,
                    background: tipoSelecionado.nome === 'Água' ? 'var(--color-water-light)' : 'var(--color-energy-light)',
                    color: tipoSelecionado.nome === 'Água' ? 'var(--color-water)' : 'var(--color-energy)',
                    padding: '2px 8px', borderRadius: 20, fontWeight: 600,
                  }}>
                    {tipoSelecionado.unidadeMedida}
                  </span>
                )}
              </label>
              <input
                id="quantidade"
                type="number"
                min="0"
                step="0.01"
                className={`form-control ${erros.quantidade ? 'error' : ''}`}
                placeholder={tipoSelecionado ? `Ex: ${tipoSelecionado.nome === 'Água' ? '12.5' : '210'}` : 'Ex: 12.5'}
                value={quantidade}
                onChange={(e) => { setQuantidade(e.target.value); setErros((p) => ({ ...p, quantidade: '' })); }}
              />
              {erros.quantidade
                ? <span className="form-error"><AlertCircle size={13} />{erros.quantidade}</span>
                : <span className="form-hint">
                    {tipoSelecionado?.nome === 'Água' ? 'Informe em metros cúbicos (m³) conforme a conta de água.' : ''}
                    {tipoSelecionado?.nome === 'Energia' ? 'Informe em quilowatt-hora (kWh) conforme a conta de energia.' : ''}
                  </span>
              }
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="periodo">Período de referência</label>
              <input
                id="periodo"
                type="month"
                className={`form-control ${erros.periodo ? 'error' : ''}`}
                value={periodo}
                onChange={(e) => { setPeriodo(e.target.value); setErros((p) => ({ ...p, periodo: '' })); }}
              />
              {erros.periodo
                ? <span className="form-error"><AlertCircle size={13} />{erros.periodo}</span>
                : <span className="form-hint">Mês e ano ao qual o consumo se refere (ex: mês da conta).</span>
              }
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="valorPago">
                Valor pago <span>(opcional)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 12, top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-gray-400)', fontSize: 14, pointerEvents: 'none',
                }}>R$</span>
                <input
                  id="valorPago"
                  type="number"
                  min="0"
                  step="0.01"
                  className={`form-control ${erros.valorPago ? 'error' : ''}`}
                  placeholder="0,00"
                  value={valorPago}
                  onChange={(e) => { setValorPago(e.target.value); setErros((p) => ({ ...p, valorPago: '' })); }}
                  style={{ paddingLeft: 36 }}
                />
              </div>
              {erros.valorPago && (
                <span className="form-error"><AlertCircle size={13} />{erros.valorPago}</span>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate(-1)}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`btn btn-lg ${tipoSelecionado?.nome === 'Água' ? 'btn-water' : tipoSelecionado?.nome === 'Energia' ? 'btn-energy' : 'btn-primary'}`}
                disabled={carregando}
                style={{ flex: 1 }}
              >
                {carregando
                  ? <><span className="loading-spinner" /> Salvando...</>
                  : <><CheckCircle2 size={18} /> Registrar consumo</>
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
