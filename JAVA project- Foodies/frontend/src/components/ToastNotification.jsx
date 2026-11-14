import { useCart } from '../context/CartContext';

export default function ToastNotification() {
  const { toast, dismissToast } = useCart();

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`toast-notification ${toast.type === 'error' ? 'error' : ''}`}
    >
      <span>{toast.message}</span>
      <button
        type="button"
        onClick={dismissToast}
        aria-label="Dismiss notification"
        style={{
          background: 'transparent',
          border: 'none',
          color: '#ffffff',
          fontWeight: 800,
          cursor: 'pointer',
        }}
      >
        ✕
      </button>
    </div>
  );
}

