import { useState } from 'react';
import Modal from '../../components/shared/Modal';
import api from '../../services/api';
import { Pagamento } from '../../types';
import { formatCurrency, formatDate, formatMesReferencia } from '../../utils';
import { useToast } from '../../context/ToastContext';

interface Props {
  pagamento: Pagamento;
  onClose: () => void;
}

export default function PagarModal({ pagamento, onClose }: Props) {
  const hoje = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    valorPago: String(Number(pagamento.valorCobrado).toFixed(2)),
    dataPagamento: hoje,
    formaPagamento: 'PIX',
    observacoes: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post(`/pagamentos/${pagamento.id}/pagar`, {
        valorPago: Number(form.valorPago),
        dataPagamento: form.dataPagamento,
        formaPagamento: form.formaPagamento,
        observacoes: form.observacoes || null,
      });
      toast('Pagamento registrado com sucesso!');
      onClose();
    } catch (err: any) {
      toast(err.response?.data?.message || 'Erro ao registrar pagamento', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const formasPgto = [
    { value: 'PIX', label: 'PIX' },
    { value: 'BOLETO', label: 'Boleto' },
    { value: 'CARTAO_CREDITO', label: 'Cartão de Crédito' },
    { value: 'CARTAO_DEBITO', label: 'Cartão de Débito' },
    { value: 'DINHEIRO', label: 'Dinheiro' },
  ];

  return (
    <Modal isOpen onClose={onClose} title="Registrar Pagamento" size="sm">
      <div className="mb-4 p-3 bg-primary-50 rounded-lg text-sm space-y-1">
        <div><span className="text-gray-500">Estudante:</span> <strong>{pagamento.matricula?.estudante?.nomeCompleto}</strong></div>
        <div><span className="text-gray-500">Mês:</span> <strong>{formatMesReferencia(pagamento.mesReferencia)}</strong></div>
        <div><span className="text-gray-500">Vencimento:</span> <strong>{formatDate(pagamento.dataVencimento)}</strong></div>
        <div><span className="text-gray-500">Valor cobrado:</span> <strong>{formatCurrency(pagamento.valorCobrado)}</strong></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="label">Valor Pago (R$)</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={form.valorPago}
            onChange={(e) => setForm((p) => ({ ...p, valorPago: e.target.value }))}
            className="input"
            required
          />
        </div>
        <div>
          <label className="label">Data do Pagamento</label>
          <input
            type="date"
            value={form.dataPagamento}
            onChange={(e) => setForm((p) => ({ ...p, dataPagamento: e.target.value }))}
            className="input"
            required
          />
        </div>
        <div>
          <label className="label">Forma de Pagamento</label>
          <select value={form.formaPagamento} onChange={(e) => setForm((p) => ({ ...p, formaPagamento: e.target.value }))} className="input">
            {formasPgto.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Observações</label>
          <input value={form.observacoes} onChange={(e) => setForm((p) => ({ ...p, observacoes: e.target.value }))} className="input" placeholder="Opcional..." />
        </div>
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button type="submit" disabled={isLoading} className="btn-primary flex-1">
            {isLoading ? 'Registrando...' : 'Confirmar Pagamento'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
