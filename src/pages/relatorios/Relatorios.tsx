import { useState } from 'react';
import { FileText, Download } from 'lucide-react';
import Header from '../../components/layout/Header';

const relatorios = [
  {
    titulo: 'Lista de Chamada por Turma',
    descricao: 'Gera lista de chamada com nomes e colunas para marcação de presença.',
    icon: '📋',
    tipo: 'turma',
  },
  {
    titulo: 'Ficha do Estudante',
    descricao: 'Ficha completa com dados cadastrais, endereço e matrículas do aluno.',
    icon: '👤',
    tipo: 'estudante',
  },
  {
    titulo: 'Contrato de Matrícula',
    descricao: 'Contrato oficial com dados do curso, valores e campo de assinatura.',
    icon: '📄',
    tipo: 'contrato',
  },
  {
    titulo: 'Recibo de Pagamento',
    descricao: 'Comprovante de mensalidade quitada.',
    icon: '💰',
    tipo: 'pagamento',
  },
];

export default function Relatorios() {
  const [idBusca, setIdBusca] = useState('');
  const [tipoSelecionado, setTipoSelecionado] = useState('');

  const endpoints: Record<string, string> = {
    turma: `/api/relatorios/chamada/${idBusca}`,
    estudante: `/api/relatorios/ficha/${idBusca}`,
    contrato: `/api/relatorios/contrato/${idBusca}`,
    pagamento: `/api/relatorios/recibo-pagamento/${idBusca}`,
  };

  const instrucoes: Record<string, string> = {
    turma: 'Insira o ID da turma',
    estudante: 'Insira o ID do estudante',
    contrato: 'Insira o ID da matrícula',
    pagamento: 'Insira o ID do pagamento',
  };

  const abrirRelatorio = () => {
    if (!idBusca || !tipoSelecionado) return;
    window.open(endpoints[tipoSelecionado], '_blank');
  };

  return (
    <div>
      <Header title="Relatórios e PDFs" subtitle="Gere documentos oficiais do sistema" />

      <div className="mt-6 space-y-6">
        {/* Cards dos relatórios */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {relatorios.map((r) => (
            <div key={r.tipo} className="card p-5 flex items-start gap-4 hover:border-primary-300 transition-colors cursor-pointer"
              onClick={() => setTipoSelecionado(r.tipo)}>
              <div className="text-3xl">{r.icon}</div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{r.titulo}</div>
                <div className="text-sm text-gray-500 mt-0.5">{r.descricao}</div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 ${tipoSelecionado === r.tipo ? 'border-primary-500 bg-primary-500' : 'border-gray-300'}`} />
            </div>
          ))}
        </div>

        {/* Gerador */}
        {tipoSelecionado && (
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={18} className="text-primary-600" />
              Gerar PDF
            </h3>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="label">{instrucoes[tipoSelecionado]}</label>
                <input
                  value={idBusca}
                  onChange={(e) => setIdBusca(e.target.value)}
                  className="input font-mono"
                  placeholder="UUID do registro..."
                />
              </div>
              <div className="flex items-end">
                <button onClick={abrirRelatorio} disabled={!idBusca} className="btn-primary h-[38px]">
                  <Download size={16} />Gerar PDF
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Dica: O ID está visível na tela de detalhes do registro (coluna de ações).
            </p>
          </div>
        )}

        {/* Links rápidos para navegação */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-3">Acesso rápido a PDFs</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-primary-600">→</span> Na página <strong>Matrículas</strong>: botão de contrato PDF em cada linha
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-primary-600">→</span> Na página <strong>Turmas</strong>: botão lista de chamada em cada turma
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-primary-600">→</span> Na página <strong>Estudantes</strong>: botão ficha PDF em cada aluno
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-primary-600">→</span> Na página <strong>Financeiro</strong>: botão recibo nos pagamentos quitados
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
