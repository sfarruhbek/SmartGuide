export function calculateEconomics(
  daily: number,
  price: number,
  conversion: number,
  aiPerSession = 0.04,
) {
  const buyers = Math.round((daily * 30 * conversion) / 100);
  const gross = buyers * price;
  const museum = gross * 0.3;
  const payment = gross * 0.02;
  const ai = buyers * aiPerSession;
  const server = 43;
  const contribution = gross - museum - payment - ai - server;
  return {
    buyers,
    gross,
    museum,
    payment,
    ai,
    server,
    contribution,
    margin: gross ? (contribution / gross) * 100 : 0,
  };
}
