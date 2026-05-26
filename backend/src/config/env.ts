export function getPort(): number {
  const v = Number(process.env.PORT || 3000)
  return Number.isFinite(v) ? v : 3000
}

