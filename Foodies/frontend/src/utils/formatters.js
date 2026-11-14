const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export function formatRupees(value) {
  const numeric = Number(value || 0);
  return inrFormatter.format(numeric);
}

export function formatOrderDate(isoDate) {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export const ORDER_STATUS_META = {
  PLACED: { label: 'Placed', className: 'status-placed' },
  PREPARING: { label: 'Preparing', className: 'status-preparing' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', className: 'status-delivery' },
  DELIVERED: { label: 'Delivered', className: 'status-delivered' },
};

export function handleFoodImageError(event) {
  const img = event.currentTarget;
  if (img.dataset.fallbackApplied) return;
  img.dataset.fallbackApplied = 'true';
  img.src = '/images/food-fallback.svg';
}

