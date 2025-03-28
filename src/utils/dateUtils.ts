export const toLocalTime = (utcDate: string | Date) => {
  return new Date(utcDate).toLocaleString('tr-TR', {
    timeZone: 'Europe/Istanbul',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const toUTCTime = (localDate: Date) => {
  return localDate.toISOString();
};

export const formatDate = (dateString: string | null) => {
  if (!dateString) return null;
  return new Date(dateString).toLocaleString('tr-TR', {
    timeZone: 'Europe/Istanbul',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}; 