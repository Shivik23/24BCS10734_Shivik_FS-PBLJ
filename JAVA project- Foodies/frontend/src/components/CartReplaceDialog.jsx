import { useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';

export default function CartReplaceDialog() {
  const { pendingConflict, confirmReplaceCart, cancelReplaceCart } = useCart();
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (pendingConflict && !dialog.open) {
      dialog.showModal();
    } else if (!pendingConflict && dialog.open) {
      dialog.close();
    }
  }, [pendingConflict]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;

    const handleClose = () => {
      if (pendingConflict) {
        cancelReplaceCart();
      }
    };

    // Light-dismiss fallback for browsers without closedby attribute support
    const handlePointerDown = (e) => {
      if ('closedBy' in HTMLDialogElement.prototype) return;
      const rect = dialog.getBoundingClientRect();
      const outside =
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom;
      if (outside) {
        dialog.close();
      }
    };

    dialog.addEventListener('close', handleClose);
    dialog.addEventListener('pointerdown', handlePointerDown);
    return () => {
      dialog.removeEventListener('close', handleClose);
      dialog.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [pendingConflict, cancelReplaceCart]);

  return (
    <dialog
      ref={dialogRef}
      className="foodies-dialog"
      closedby="any"
      aria-labelledby="replace-cart-title"
    >
      <h2 id="replace-cart-title" className="dialog-title">
        Replace items in your cart?
      </h2>
      <p className="dialog-body">
        Your cart currently contains dishes from{' '}
        <strong>{pendingConflict?.currentRestaurantName}</strong>. Would you like to clear your
        current cart and add <strong>{pendingConflict?.menuItem?.name}</strong> instead?
      </p>
      <div className="dialog-actions">
        <button
          type="button"
          className="btn btn-secondary"
          autoFocus
          onClick={cancelReplaceCart}
        >
          Keep current cart
        </button>
        <button type="button" className="btn btn-primary" onClick={confirmReplaceCart}>
          Replace cart
        </button>
      </div>
    </dialog>
  );
}

