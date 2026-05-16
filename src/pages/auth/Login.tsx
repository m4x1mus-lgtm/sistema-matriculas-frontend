import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function Login() {
  const [email, setEmail] = useState('admin@escola.com');
  const [senha, setSenha] = useState('Admin@2025');
  const [showSenha, setShowSenha] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, senha);
      navigate('/dashboard');
    } catch (err: any) {
      toast(err.response?.data?.message || 'E-mail ou senha inválidos', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Painel esquerdo — laranja */}
      <div className="hidden lg:flex w-1/2 bg-primary-500 flex-col items-center justify-center p-12">
        <div className="text-center">
          <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-primary-500 text-5xl font-black">M</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-2">MAXIMUS</h1>
          <p className="text-orange-100 text-lg font-medium">Centro de Ensino</p>
          <div className="mt-10 space-y-3 text-left max-w-xs mx-auto">
            {['SSA 1 e SSA 2', 'Escola de Aplicação', 'ENEM Intensivo', 'Reforço Escolar'].map((item) => (
              <div key={item} className="flex items-center gap-3 text-white">
                <div className="w-2 h-2 bg-white rounded-full opacity-70" />
                <span className="text-sm opacity-90">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <span className="text-white text-3xl font-black">M</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900">MAXIMUS</h1>
            <p className="text-gray-500 text-sm">Centro de Ensino</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Bem-vindo!</h2>
            <p className="text-sm text-gray-500 mb-6">Acesse o sistema de matrículas</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="seu@email.com"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="label">Senha</label>
                <div className="relative">
                  <input
                    type={showSenha ? 'text' : 'password'}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="input pr-10"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowSenha(!showSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-2.5 mt-2"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Entrando...
                  </span>
                ) : 'Entrar'}
              </button>
            </form>

            <div className="mt-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500 font-medium mb-1">Credenciais de demonstração:</p>
              <p className="text-xs text-gray-600">Admin: <span className="font-mono">admin@escola.com</span> / <span className="font-mono">Admin@2025</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
