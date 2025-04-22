export function calculateCAGR(startValue, endValue, years) {
  return (Math.pow(endValue / startValue, 1 / years) - 1);
}

export function calculateSharpe(returns, riskFreeRate = 0.005) {
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const stdDev = Math.sqrt(returns.map(x => Math.pow(x - avgReturn, 2)).reduce((a, b) => a + b) / returns.length);
  return (avgReturn - riskFreeRate) / stdDev;
}
