const options: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
};
const dtFormat = Intl.DateTimeFormat('en-GB', options);

export const formatTimestamp = (timestamp: string): string => {
  const t = new Date(timestamp);

  return dtFormat.format(t);
};
