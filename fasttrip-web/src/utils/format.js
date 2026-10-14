const TZ = 'Africa/Accra';

// Whole prices show without decimals (GH₵120), others keep pesewas (GH₵0.50)
export const formatPrice = (n) => {
  const v = Number(n);
  return `GH₵${Number.isInteger(v) ? v : v.toFixed(2)}`;
};

export const formatDate = (
  value,
  options = { weekday: 'short', day: 'numeric', month: 'short' }
) => new Date(value).toLocaleDateString('en-GB', { ...options, timeZone: TZ });

export const formatTime = (value) =>
  new Date(value).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TZ,
  });