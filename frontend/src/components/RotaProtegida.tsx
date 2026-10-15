import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function RotaProtegida() {
  const { usuario, carregando } = useAuth();

  if (carregando) {
    return (
      <div className="loading-page">
        <span className="loading-spinner dark" />
        Carregando...
      </div>
    );
  }

  return usuario ? <Outlet /> : <Navigate to="/login" replace />;
}
