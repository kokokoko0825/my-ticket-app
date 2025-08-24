import React from 'react';
import { overlay, modal, overlayBackdrop, header, title, closeButton, content } from '~/styles/ui/modal.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title: modalTitle,
  children,
  className = '',
  style = {},
  maxWidth = '600px',
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className={overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby={modalTitle ? "modal-title" : undefined}
      onClick={handleBackdropClick}
    >
      <button
        className={overlayBackdrop}
        onClick={onClose}
        aria-label="モーダルを閉じる"
      />
      <div className={`${modal} ${className}`} style={{ ...style, maxWidth }}>
        {modalTitle && (
          <div className={header}>
            <h2 id="modal-title" className={title}>
              {modalTitle}
            </h2>
            <button
              className={closeButton}
              onClick={onClose}
              title="閉じる"
            >
              ×
            </button>
          </div>
        )}
        <div className={content}>
          {children}
        </div>
      </div>
    </div>
  );
};
