export const formatMatchPercentage = (score?: number | null): string => {
  if (score === undefined || score === null) {
    return "0";
  }

  const percentage = score * 100;
  const truncated = Math.trunc(percentage * 100) / 100;
  return Number(truncated.toFixed(2)).toString();
};
