export const formatPrice = (value: number, currency: string = '$'): string =>
  `${currency}${value.toFixed(2)}`;

export const pluralize = (count: number, singular: string, plural?: string) =>
  `${count} ${count === 1 ? singular : plural ?? `${singular}s`}`;
