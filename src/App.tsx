import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/shared/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Estudantes from './pages/estudantes/Estudantes';
import Turmas from './pages/turmas/Turmas';
import Matriculas from './pages/matriculas/Matriculas';
import Financeiro from './pages/financeiro/Financeiro';
import Relatorios from './pages/relatorios/Relatorios';
import Usuarios from './pages/usuarios/Usuarios';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Rota pública */}
            <Route path="/login" element={<Login />} />

            {/* Rotas protegidas — qualquer usuário autenticado */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/estudantes" element={<Estudantes />} />
                <Route path="/turmas" element={<Turmas />} />

                {/* Apenas admin e secretaria */}
                <Route element={<ProtectedRoute roles={['ADMIN', 'SECRETARIA']} />}>
                  <Route path="/matriculas" element={<Matriculas />} />
                  <Route path="/financeiro" element={<Financeiro />} />
                  <Route path="/relatorios" element={<Relatorios />} />
                </Route>

                {/* Apenas admin */}
                <Route element={<ProtectedRoute roles={['ADMIN']} />}>
                  <Route path="/usuarios" element={<Usuarios />} />
                </Route>
              </Route>
            </Route>

            {/* Redireciona raiz para dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
