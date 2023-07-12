export const clickhouseDatetimeFormat = (date: Date): string => {
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

export const clickhouseDatetimeNow = (): string => {
  return clickhouseDatetimeFormat(new Date());
};
