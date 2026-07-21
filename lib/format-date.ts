const formatter = new Intl.DateTimeFormat('fi-FI', {
  dateStyle: 'long',
  timeZone: 'UTC',
})

export function formatSessionDate(isoDate: string): string {
  return formatter.format(new Date(isoDate))
}
