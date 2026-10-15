import { useEffect, useState } from 'react';
import { Droplets, Zap, Leaf, AlertCircle } from 'lucide-react';
import { dicasService } from '../services/dicas.service';
import { Dica } from '../types';

type Categoria = 'Todas' | 'Agua' | 'Energia' | 'Geral';

const CATEGORIAS: { value: Categoria; label: string; icon: React.ReactNode; colorClass: string }[] = [
  { value: 'Todas', label: 'Todas', icon: <Leaf size={14} />, colorClass: '' },
  { value: 'Agua', label: 'Água', icon: <Droplets size={14} />, colorClass: 'water' },
  { value: 'Energia', label: 'Energia', icon: <Zap size={14} />, colorClass: 'energy' },
  { value: 'Geral', label: 'Geral', icon: <Leaf size={14} />, colorClass: '' },
];

const RELEVANCIA_ORDEM: Record<string, number> = { Alta: 0, Media: 1, Baixa: 2 };

function BadgeCategoria({ categoria }: { categoria: string }) {
  if (categoria === 'Agua') return <span className="badge badge-water"><Droplets size={11} />Água</span>;
  if (categoria === 'Energia') return <span className="badge badge-energy"><Zap size={11} />Energia</span>;
  return <span className="badge badge-green"><Leaf size={11} />Geral</span>;
}

function BadgeRelevancia({ nivel }: { nivel: string | null }) {
  if (!nivel) return null;
  const cores: Record<string, string> = {
    Alta: 'var(--color-danger)',
    Media: 'var(--color-warning)',
    Baixa: 'var(--color-gray-500)',
  };
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: '2px 8px',
      borderRadius: 20, background: `${cores[nivel]}18`,
      color: cores[nivel],
    }}>
      {nivel === 'Alta' ? '🔴' : nivel === 'Media' ? '🟡' : '🔵'} {nivel}
    </span>
  );
}

export default function Dicas() {
  const [dicas, setDicas] = useState<Dica[]>([]);
  const [categoria, setCategoria] = useState<Categoria>('Todas');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    setCarregando(true);
    setErro('');
    dicasService.listar(categoria === 'Todas' ? undefined : categoria)
      .then((d) => {
        const ordenadas = [...d].sort((a, b) => {
          const ra = RELEVANCIA_ORDEM[a.nivelRelevancia || 'Baixa'] ?? 2;
          const rb = RELEVANCIA_ORDEM[b.nivelRelevancia || 'Baixa'] ?? 2;
          return ra - rb;
        });
        setDicas(ordenadas);
      })
      .catch(() => setErro('Não foi possível carregar as dicas.'))
      .finally(() => setCarregando(false));
  }, [categoria]);

  const iconeEmoji = (cat: string) => {
    if (cat === 'Agua') return '💧';
    if (cat === 'Energia') return '⚡';
    return '🌿';
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Dicas de Consumo Consciente</h1>
        <p className="page-subtitle">Orientações práticas para economizar água, energia e cuidar do meio ambiente</p>
      </div>

      <div className="page-content">
        {/* Filtros */}
        <div className="filter-bar">
          {CATEGORIAS.map((cat) => (
            <button
              key={cat.value}
              className={`filter-chip ${cat.colorClass} ${categoria === cat.value ? 'active' : ''}`}
              onClick={() => setCategoria(cat.value)}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {erro && <div className="alert alert-error"><AlertCircle size={16} />{erro}</div>}

        {carregando && (
          <div className="loading-page"><span className="loading-spinner dark" />Carregando dicas...</div>
        )}

        {!carregando && dicas.length === 0 && (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon">💡</div>
              <div className="empty-state-title">Nenhuma dica encontrada</div>
              <div className="empty-state-text">Nenhuma dica disponível para a categoria selecionada.</div>
            </div>
          </div>
        )}

        {!carregando && dicas.length > 0 && (
          <>
            <p style={{ fontSize: 13, color: 'var(--color-gray-500)', marginBottom: 16 }}>
              {dicas.length} dica{dicas.length !== 1 ? 's' : ''} encontrada{dicas.length !== 1 ? 's' : ''}
            </p>
            <div className="dicas-grid">
              {dicas.map((dica) => (
                <div key={dica.id} className="dica-card">
                  <div className="dica-card-header">
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <span style={{ fontSize: 24, flexShrink: 0 }}>{iconeEmoji(dica.categoria)}</span>
                      <div className="dica-card-title">{dica.titulo}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                    <BadgeCategoria categoria={dica.categoria} />
                    <BadgeRelevancia nivel={dica.nivelRelevancia} />
                  </div>
                  <p className="dica-card-desc">{dica.descricao}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
