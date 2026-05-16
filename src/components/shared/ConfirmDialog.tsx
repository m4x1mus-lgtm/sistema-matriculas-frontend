import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmLabel?: string;
  isLoading?: boolean;
  variant?: 'danger' | 'warning';
}

export default function ConfirmDialog({
  isOpen, onClose, onConfirm, title = 'Confirmar ação', message,
  confirmLabel = 'Confirmar', isLoading, variant = 'danger',
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${variant === 'danger' ? 'bg-red-100' : 'bg-yellow-100'}`}>
          <AlertTriangle className={variant === 'danger' ? 'text-red-600' : 'text-yellow-600'} size={24} />
        </div>
        <p className="text-sm text-gray-600">{message}</p>
        <div className="flex gap-3 w-full">
          <button onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 btn ${variant === 'danger' ? 'btn-danger' : 'bg-yellow-500 text-white hover:bg-yellow-600 btn'}`}
          >
            {isLoading ? 'Aguarde...' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
