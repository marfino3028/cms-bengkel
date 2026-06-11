export function useFormat() {
  const rupiah = (n: number | string | null | undefined): string => {
    const value = Number(n || 0)
    return 'Rp ' + value.toLocaleString('id-ID')
  }

  const date = (d: string | Date | null | undefined): string => {
    if (!d) return '-'
    return new Date(d).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const dateTime = (d: string | Date | null | undefined): string => {
    if (!d) return '-'
    return new Date(d).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return { rupiah, date, dateTime }
}
