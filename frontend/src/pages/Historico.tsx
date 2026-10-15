import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Pencil, Trash2, Eye, AlertCircle, Droplets, Zap,
  CheckCircle2, X, Plus, Filter,
} from 'lucide-react';
import { consumoService } from '../services/consumo.service';
import { Consumo, TipoConsumo } from '../types';
import { formatarNumero, formatarMoeda, formatarPeriodo, formatarData, periodoAtual } from '../utils/formatters';

interface ModalEdicaoProps {
  consumo: Consumo;
  tipos: TipoConsumo[];
  onSalvar: (id: number, dados: Partial<{ tipoConsumoId: number; quantidade: number; periodo: string; valorPago: number | null }>) => Promise<void>;
  onFechar: () => void;
}

function ModalEdicao({ consumo, tipos, onSalvar, onFechar }: ModalEdicaoProps) {
  const [tipoConsumoId, setTipoConsumoId] = useState(String(consumo.tipoConsumoId));
  const [quantidade, setQuantidade] = useState(String(consumo.quantidade));
  const [periodo, setPeriodo] = useState(consumo.periodo);
  const [valorPago, setValorPago] = useState(consumo.valorPago !== null ? String(consumo.valorPago) : '');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function handleSalvar() {
    setErro('');
    if (!quantidade || parseFloat(quantidade) < 0) {
      setErro('Informe uma quantidade válida e não negativa.');
      return;
    }
    setSalvando(true);
    try {
      await onSalvar(consumo.id, {
        tipoConsumoId: parseInt(tipoConsumoId),
        quantidade: parseFloat(quantidade),
        periodo,
        valorPago: valorPago ? parseFloat(valorPago) : null,
      });
    } catch (err: unknown) {
      setErro((err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Erro ao salvar.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-edicao-titulo">
      <div className="modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 className="modal-title" id="modal-edicao-titulo" style={{ margin: 0 }}>Editar registro</h2>
          <button onClick={onFechar} className="btn btn-outline btn-sm" aria-label="Fechar"><X size={16} /></button>
        </div>

        {erro && <div className="alert alert-error"><AlertCircle size={16} />{erro}</div>}

        <div className="form-group">
          <label className="form-label" htmlFor="edit-tipo">Tipo de consumo</label>
          <select id="edit-tipo" className="form-control" value={tipoConsumoId} onChange={(e) => setTipoConsumoId(e.target.value)}>
            {tipos.map((t) => <option key={t.id} value={t.id}>{t.nome} ({t.unidadeMedida})</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="edit-quantidade">Quantidade</label>
          <input
            id="edit-quantidade"
            type="number" min="0" step="0.01"
            className="form-control"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="edit-periodo">Período</label>
          <input
            id="edit-periodo"
            type="month"
            className="form-control"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="edit-valor">Valor pago <span>(opcional)</span></label>
          <input
            id="edit-valor"
            type="number" min="0" step="0.01"
            className="form-control"
            placeholder="0,00"
            value={valorPago}
            onChange={(e) => setValorPago(e.target.value)}
          />
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onFechar}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSalvar} disabled={salvando}>
            {salvando ? <><span className="loading-spinner" />Salvando...</> : <><CheckCircle2 size={16} />Salvar</>}
          </button>
        </div>
      </div>
    </div>
  );
}

interface ModalConfirmacaoProps {
  mensagem: string;
  onConfirmar: () => void;
  onCancelar: () => void;
  carregando?: boolean;
}

function ModalConfirmacao({ mensagem, onConfirmar, onCancelar, carregando }: ModalConfirmacaoProps) {
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-confirm-titulo">
      <div className="modal" style={{ maxWidth: 400 }}>
        <h2 className="modal-title" id="modal-confirm-titulo" style={{ fontSize: 17 }}>Confirmar exclusão</h2>
        <p style={{ fontSize: 14, color: 'var(--color-gray-600)', lineHeight: 1.6 }}>{mensagem}</p>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onCancelar}>Cancelar</button>
          <button className="btn btn-danger" onClick={onConfirmar} disabled={carregando}>
            {carregando ? <><span className="loading-spinner" />Excluindo...</> : <><Trash2 size={16} />Excluir</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Historico() {
  const [consumos, setConsumos] = useState<Consumo[]>([]);
  const [tipos, setTipos] = useState<TipoConsumo[]>([]);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroPeriodoInicio, setFiltroPeriodoInicio] = useState('');
  const [filtroPeriodoFim, setFiltroPeriodoFim] = useState(periodoAtual());
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [editando, setEditando] = useState<Consumo | null>(null);
  const [excluindo, setExcluindo] = useState<number | null>(null);
  const [excluindoId, setExcluindoId] = useState<number | null>(null);

  useEffect(() => {
    consumoService.listarTipos().then(setTipos).catch(() => {});
  }, []);

  const carregarConsumos = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      const dados = await consumoService.listar({
        tipo: filtroTipo || undefined,
        periodoInicio: filtroPeriodoInicio || undefined,
        periodoFim: filtroPeriodoFim || undefined,
      });
      setConsumos(dados);
    } catch {
      setErro('Erro ao carregar o histórico.');
    } finally {
      setCarregando(false);
    }
  }, [filtroTipo, filtroPeriodoInicio, filtroPeriodoFim]);

  useEffect(() => {
    carregarConsumos();
  }, [carregarConsumos]);

  async function handleEditar(id: number, dados: Parameters<typeof consumoService.atualizar>[1]) {
    await consumoService.atualizar(id, dados);
    setEditando(null);
    setSucesso('Registro atualizado com sucesso.');
    setTimeout(() => setSucesso(''), 3500);
    carregarConsumos();
  }

  async function handleExcluir() {
    if (excluindo === null) return;
    setExcluindoId(excluindo);
    try {
      await consumoService.deletar(excluindo);
      setExcluindo(null);
      setSucesso('Registro excluído com sucesso.');
      setTimeout(() => setSucesso(''), 3500);
      carregarConsumos();
    } catch {
      setErro('Erro ao excluir o registro.');
    } finally {
      setExcluindoId(null);
    }
  }

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="page-title">Histórico de Consumo</h1>
            <p className="page-subtitle">Consulte, edite e exclua seus registros</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
            >
              <Filter size={15} /> Filtros
            </button>
            <Link to="/novo-consumo" className="btn btn-primary btn-sm"><Plus size={15} />Novo</Link>
          </div>
        </div>
      </div>

      <div className="page-content">
        {/* Filtros */}
        {mostrarFiltros && (
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="filtro-tipo">Tipo</label>
                <select id="filtro-tipo" className="form-control" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
                  <option value="">Todos</option>
                  {tipos.map((t) => <option key={t.id} value={t.nome}>{t.nome}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="filtro-inicio">Período — de</label>
                <input id="filtro-inicio" type="month" className="form-control" value={filtroPeriodoInicio} onChange={(e) => setFiltroPeriodoInicio(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="filtro-fim">Período — até</label>
                <input id="filtro-fim" type="month" className="form-control" value={filtroPeriodoFim} onChange={(e) => setFiltroPeriodoFim(e.target.value)} />
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <button className="btn btn-outline btn-sm" onClick={() => { setFiltroTipo(''); setFiltroPeriodoInicio(''); setFiltroPeriodoFim(periodoAtual()); }}>
                Limpar filtros
              </button>
            </div>
          </div>
        )}

        {sucesso && <div className="alert alert-success"><CheckCircle2 size={16} />{sucesso}</div>}
        {erro && <div className="alert alert-error"><AlertCircle size={16} />{erro}</div>}

        {carregando && (
          <div className="loading-page"><span className="loading-spinner dark" />Carregando...</div>
        )}

        {!carregando && consumos.length === 0 && (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <div className="empty-state-title">Nenhum registro encontrado</div>
              <div className="empty-state-text">
                {filtroTipo || filtroPeriodoInicio
                  ? 'Nenhum registro para os filtros selecionados. Tente outros filtros.'
                  : 'Você ainda não registrou nenhum consumo.'}
              </div>
              <Link to="/novo-consumo" className="btn btn-primary" style={{ marginTop: 8 }}>
                <Plus size={16} /> Registrar consumo
              </Link>
            </div>
          </div>
        )}

        {!carregando && consumos.length > 0 && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Período</th>
                  <th>Tipo</th>
                  <th>Quantidade</th>
                  <th>Valor pago</th>
                  <th>Registrado em</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {consumos.map((consumo) => {
                  const isAgua = consumo.tipoConsumo.nome === 'Água';
                  return (
                    <tr key={consumo.id}>
                      <td style={{ fontWeight: 600 }}>{formatarPeriodo(consumo.periodo)}</td>
                      <td>
                        <span className={`badge ${isAgua ? 'badge-water' : 'badge-energy'}`}>
                          {isAgua ? <Droplets size={12} /> : <Zap size={12} />}
                          {consumo.tipoConsumo.nome}
                        </span>
                      </td>
                      <td>
                        <strong>{formatarNumero(consumo.quantidade)}</strong>{' '}
                        <span style={{ color: 'var(--color-gray-400)', fontSize: 12 }}>{consumo.tipoConsumo.unidadeMedida}</span>
                      </td>
                      <td>
                        {consumo.valorPago !== null ? formatarMoeda(consumo.valorPago) : '—'}
                      </td>
                      <td style={{ color: 'var(--color-gray-500)', fontSize: 13 }}>
                        {formatarData(consumo.dataRegistro)}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <Link
                            to={`/resultado/${consumo.id}`}
                            className="btn btn-outline btn-sm"
                            title="Ver análise"
                          >
                            <Eye size={14} />
                          </Link>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => setEditando(consumo)}
                            title="Editar"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => setExcluindo(consumo.id)}
                            title="Excluir"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!carregando && consumos.length > 0 && (
          <p style={{ fontSize: 13, color: 'var(--color-gray-400)', marginTop: 12 }}>
            {consumos.length} registro{consumos.length !== 1 ? 's' : ''} encontrado{consumos.length !== 1 ? 's' : ''}.
          </p>
        )}
      </div>

      {editando && (
        <ModalEdicao
          consumo={editando}
          tipos={tipos}
          onSalvar={handleEditar}
          onFechar={() => setEditando(null)}
        />
      )}

      {excluindo !== null && (
        <ModalConfirmacao
          mensagem="Este registro e sua análise serão excluídos permanentemente. Os indicadores serão recalculados. Deseja continuar?"
          onConfirmar={handleExcluir}
          onCancelar={() => setExcluindo(null)}
          carregando={excluindoId !== null}
        />
      )}
    </>
  );
}
