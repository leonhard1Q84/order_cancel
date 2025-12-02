
// Formats a date string into the Store's Local Time
export const formatStoreTime = (dateStr: string | undefined, timeZone: string) => {
  if (!dateStr) return '--';
  
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: timeZone,
    }).format(date).replace(/\//g, '-');
  } catch (e) {
    console.error("Timezone error", e);
    return dateStr;
  }
};

// Check if a date is within the next N hours from now
export const isWithinNextHours = (dateStr: string, hours: number) => {
  const now = new Date();
  const target = new Date(dateStr);
  const diff = target.getTime() - now.getTime();
  const limit = hours * 60 * 60 * 1000;
  return diff >= 0 && diff <= limit;
};
