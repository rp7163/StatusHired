import React from 'react';
import { Modal } from './Modal.jsx';
import { Button } from './Button.jsx';
import { AlertTriangle } from 'lucide-react';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onCancel,
  onConfirm,
  title,
  description,
  message,
  confirmText,
  confirmLabel,
  cancelText = 'Cancel',
  cancelLabel,
  isDestructive = false,
  variant,
  isLoading = false,
}) => {
  const handleClose = onCancel || onClose || (() => {});
  const resolvedConfirmText = confirmLabel || confirmText || 'Confirm';
  const resolvedCancelText = cancelLabel || cancelText || 'Cancel';
  const resolvedDesc = message || description || '';
  const isDanger = isDestructive || variant === 'danger';

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="sm">
      <div className="flex flex-col items-center text-center">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center mb-3.5 ${
            isDanger ? 'bg-[#FF453A]/12 text-[#FF453A]' : 'bg-[#10B981]/12 text-[#10B981]'
          }`}
        >
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-[18px] font-bold text-[#0C1A13] dark:text-[#E8F5EE] tracking-tight">{title}</h3>
        {resolvedDesc && (
          <p className="text-[14px] text-[#54635B] dark:text-[#8AA097] mt-1.5 mb-6 leading-relaxed">
            {resolvedDesc}
          </p>
        )}
        <div className="flex items-center gap-2.5 w-full mt-4">
          <Button variant="secondary" className="flex-1" onClick={handleClose} disabled={isLoading}>
            {resolvedCancelText}
          </Button>
          <Button
            variant={isDanger ? 'danger' : 'primary'}
            className="flex-1"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {resolvedConfirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
