export function calculateDuration(
  messages: { timestamp: number | null }[],
  startedAt: string,
  endedAt: string | null
): number {
  if (messages && messages.length >= 2) {
    const timestamps = messages
      .map((m) => m.timestamp)
      .filter((t): t is number => t !== null)
      .sort((a, b) => a - b)

    if (timestamps.length >= 2) {
      return Math.round((timestamps[timestamps.length - 1] - timestamps[0]) / 1000)
    }
  }

  if (endedAt) {
    return Math.round(
      (new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 1000
    )
  }

  return 0
}
