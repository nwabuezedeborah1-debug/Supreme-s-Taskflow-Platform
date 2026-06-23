import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl',
};

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, size = 'md' }) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    /* Outer: covers viewport, flex-centred, z above everything */
    <div
      className="fixed inset-0 flex items-end sm:items-center justify-center sm:p-4"
      style={{ zIndex: 9999 }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`
          relative w-full ${sizeMap[size]}
          bg-[#111118] border border-[#2a2a38]
          rounded-t-2xl sm:rounded-2xl shadow-2xl
          flex flex-col
          max-h-[92vh] sm:max-h-[88vh]
          animate-slide-up
        `}
        style={{ zIndex: 10000 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle — mobile hint */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-[#3a3a48]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a38] shrink-0">
          <h2 id="modal-title" className="text-base font-semibold text-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#2a2a38] active:bg-[#3a3a48] transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 p-5">
          {children}
        </div>
      </div>
    </div>
  );
};
