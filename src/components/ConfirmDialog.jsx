import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Accessible confirmation dialog that replaces window.confirm.
 * Implements focus trap, Escape key close, and full ARIA semantics.
 */
export default function ConfirmDialog({ title, message, onConfirm, onCancel }) {
  const cancelRef = useRef(null);
  const confirmRef = useRef(null);

  // Focus the cancel button on open (safer default)
  useEffect(() => {
    cancelRef.current?.focus();
  }, []);

  // Trap focus within the dialog and allow Escape to cancel
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCancel();
        return;
      }
      if (e.key !== 'Tab') return;
      const focusable = [cancelRef.current, confirmRef.current].filter(Boolean);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      role="presentation"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-sm w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-3xl mb-3 text-center">⚠️</div>
        <h2
          id="confirm-title"
          className="text-lg font-extrabold text-white text-center mb-2"
        >
          {title}
        </h2>
        <p
          id="confirm-message"
          className="text-white/60 text-sm text-center mb-6 leading-relaxed"
        >
          {message}
        </p>
        <div className="flex gap-3">
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white font-bold transition-all text-sm focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            Cancel
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            className="flex-1 py-3 rounded-2xl bg-red-500/80 border border-red-500/30 text-white font-bold hover:bg-red-500 transition-all text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            Reset Data
          </button>
        </div>
      </div>
    </div>
  );
}

ConfirmDialog.propTypes = {
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
