import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import RotaProtegida from './components/RotaProtegida';
import Layout from './components/Layout';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Dashboard from './pages/Dashboard';
import NovoConsumo from './pages/NovoConsumo';
import ResultadoAnalise from './pages/ResultadoAnalise';
import Historico from './pages/Historico';
import Graficos from './pages/Graficos';
import Dicas from './pages/Dicas';
import Perfil from './pages/Perfil';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />

          {/* Rotas protegidas — requerem autenticação */}
          <Route element={<RotaProtegida />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/novo-consumo" element={<NovoConsumo />} />
              <Route path="/resultado/:id" element={<ResultadoAnalise />} />
              <Route path="/historico" element={<Historico />} />
              <Route path="/graficos" element={<Graficos />} />
              <Route path="/dicas" element={<Dicas />} />
              <Route path="/perfil" element={<Perfil />} />
            </Route>
          </Route>

          {/* Redireciona qualquer rota desconhecida para o dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
