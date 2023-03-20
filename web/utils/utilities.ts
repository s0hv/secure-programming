export const formatTimestamp = (timestamp: string) => {
  const t = new Date(timestamp);
  return `${t.getHours()}:${t.getMinutes()} · ${t.getDate()}.${t.getMonth() + 1}.${t.getFullYear()}`;
};
