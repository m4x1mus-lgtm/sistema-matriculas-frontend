import { useEffect, useState } from 'react';
import { Users, TrendingUp, AlertCircle, BookOpen, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../../services/api';
import { DashboardKPIs } from '../../types';
import { formatCurrency, modalidadeLabel } from '../../utils';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Header from '../../components/layout/Header';

const COLORS = ['#1d4ed8', '#0891b2', '#059669', '#d97706', '#dc2626', '#7c3aed'];

function KPICard({ title, value, subtitle, icon: Icon, color }: {
  title: string; value: string | number; subtitle?: string; icon: any; color: string;
}) {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/kpis')
      .then(({ data }) => setKpis(data.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <LoadingSpinner />;
  if (!kpis) return null;

  const modalidadeData = Object.entries(kpis.matriculasPorModalidade).map(([key, value]) => ({
    name: modalidadeLabel[key] || key,
    alunos: value,
  }));

  const pieData = kpis.vagasPorTurma.slice(0, 6).map((t) => ({
    name: t.nome.length > 20 ? t.nome.slice(0, 20) + '...' : t.nome,
    value: t.alunosAtivos,
  }));

  const taxaArrecadacao = kpis.receitaPrevista > 0
    ? Math.round((kpis.receitaRealizada / kpis.receitaPrevista) * 100)
    : 0;

  return (
    <div>
      <Header title="Dashboard" subtitle={`Visão geral de ${kpis.mesReferencia}`} />

      <div className="mt-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <KPICard
            title="Alunos Matriculados"
            value={kpis.totalAlunos}
            subtitle={`+${kpis.novasMatriculasMes} novas este mês`}
            icon={Users}
            color="bg-primary-500"
          />
          <KPICard
            title="Receita Prevista"
            value={formatCurrency(kpis.receitaPrevista)}
            subtitle={`Mês ${kpis.mesReferencia}`}
            icon={TrendingUp}
            color="bg-green-600"
          />
          <KPICard
            title="Receita Realizada"
            value={formatCurrency(kpis.receitaRealizada)}
            subtitle={`${taxaArrecadacao}% do previsto`}
            icon={ArrowUpRight}
            color="bg-emerald-600"
          />
          <KPICard
            title="Pagamentos Atrasados"
            value={kpis.pagamentosAtrasados.quantidade}
            subtitle={formatCurrency(kpis.pagamentosAtrasados.valor)}
            icon={AlertCircle}
            color="bg-red-600"
          />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Matrículas por modalidade */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Matrículas por Modalidade</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={modalidadeData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => [v, 'Alunos']} />
                <Bar dataKey="alunos" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Distribuição por turma */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Distribuição por Turma</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vagas por turma */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <BookOpen size={18} className="text-primary-600" />
              <h3 className="font-semibold text-gray-900">Ocupação das Turmas</h3>
            </div>
          </div>
          <div className="p-6 space-y-3">
            {kpis.vagasPorTurma.map((turma) => (
              <div key={turma.id}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{turma.nome}</span>
                  <span className="text-gray-500">
                    {turma.alunosAtivos}/{turma.capacidadeMaxima} alunos
                    {turma.vagasDisponiveis === 0 && (
                      <span className="ml-2 badge-red">Lotado</span>
                    )}
                    {turma.vagasDisponiveis > 0 && turma.percentualOcupacao >= 80 && (
                      <span className="ml-2 badge-yellow">Quase cheio</span>
                    )}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${turma.percentualOcupacao >= 100 ? 'bg-red-500' : turma.percentualOcupacao >= 80 ? 'bg-yellow-500' : 'bg-primary-500'}`}
                    style={{ width: `${Math.min(turma.percentualOcupacao, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
