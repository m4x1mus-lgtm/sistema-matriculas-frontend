import { useState } from 'react';
import Modal from '../../components/shared/Modal';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface Props {
  matriculaId: string;
  novoStatus: string;
  onClose: () => void;
}

const statusLabel: Record<string, string> = {
  TRANCADA: 'Trancar Matrícula', CANCELADA: 'Cancelar Matrícula',
  CONCLUIDA: 'Concluir Matrícula', ATIVA: 'Reativar Matrícula',
};

export default function AlterarStatusModal({ matriculaId, novoStatus, onClose }: Props) {
  const [motivo, setMotivo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.patch(`/matriculas/${matriculaId}/status`, { status: novoStatus, motivo });
      toast(`Matrícula ${novoStatus.toLowerCase()} com sucesso!`);
      onClose();
    } catch (err: any) {
      toast(err.response?.data?.message || 'Erro ao alterar status', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const isPerigo = novoStatus === 'CANCELADA';

  return (
    <Modal isOpen onClose={onClose} title={statusLabel[novoStatus] || 'Alterar Status'} size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-gray-600">
          Informe o motivo para <strong>{statusLabel[novoStatus]?.toLowerCase()}</strong>:
        </p>
        <div>
          <label className="label">Motivo <span className="text-red-500">*</span></label>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            className="input h-24 resize-none"
            placeholder="Descreva o motivo..."
            required
            minLength={5}
          />
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button type="submit" disabled={isLoading} className={`flex-1 btn ${isPerigo ? 'btn-danger' : 'btn-primary'}`}>
            {isLoading ? 'Aguarde...' : 'Confirmar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
