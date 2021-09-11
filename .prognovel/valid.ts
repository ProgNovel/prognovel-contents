export function isValidWeight(weight: number | string) {
  return /^\d*\.?\d*%?$/gm.test(weight.toString());
}
