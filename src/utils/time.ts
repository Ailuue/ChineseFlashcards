export function greeting(): string {
  const h = new Date().getHours()
  if (h >= 3 && h < 12) return '早安'
  if (h >= 12 && h < 17) return '午安'
  return '晚安'
}

export function timeAgo(iso: string | null): string {
  if (!iso) return 'never'
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (secs < 60) return 'just now'
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  if (hours < 48) return 'yesterday'
  return `${Math.floor(hours / 24)}d ago`
}
