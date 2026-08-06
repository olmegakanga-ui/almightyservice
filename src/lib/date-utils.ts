const DAYS   = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi']
const MONTHS = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre']

export function parseEventDate(iso: string) {
  const [datePart, timePart = '00:00'] = iso.split('T')
  const [y, m, d] = datePart.split('-').map(Number)
  const [h, min]  = timePart.slice(0, 5).split(':')
  // Date en UTC pour obtenir le bon jour de semaine sans décalage
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay()
  return {
    dayName:   DAYS[dow],
    dayNumber: d,
    monthName: MONTHS[m - 1],
    year:      y,
    time:      `${h}h${min}`,
    full:      `${d} ${MONTHS[m - 1]} ${y}`,
    fullLong:  `${DAYS[dow]} ${d} ${MONTHS[m - 1]} ${y}`,
  }
}
