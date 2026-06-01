export interface MessageTemplateData {
  guestName:     string
  groomName:     string
  brideName:     string
  eventDate:     string
  eventTime:     string
  venueName:     string
  invitationUrl: string
}

export function formatDate(isoString: string): string {
  const date   = new Date(isoString)
  const days   = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi']
  const months = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre']
  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
}

export function formatTime(isoString: string): string {
  const date = new Date(isoString)
  return `${date.getHours()}h${String(date.getMinutes()).padStart(2, '0')}`
}

// Message initial d'invitation
export function invitationTemplate(data: MessageTemplateData): string {
  return `Cher(e) *${data.guestName}*,

Vous êtes cordialement invité(e) à célébrer le mariage de

✨ *${data.groomName} & ${data.brideName}* ✨

📅 ${data.eventDate}
🕐 À partir de ${data.eventTime}
📍 ${data.venueName}

Votre invitation personnalisée :
👇 ${data.invitationUrl}

Merci de confirmer votre présence via ce lien.

_— AlmightyService_`
}

// Message de relance (non-cliqueurs)
export function reminderTemplate(data: MessageTemplateData): string {
  return `Bonjour *${data.guestName}* 👋

Nous n'avons pas encore reçu votre confirmation pour le mariage de *${data.groomName} & ${data.brideName}*.

Le grand jour approche ! 🎊
📅 ${data.eventDate}

Confirmez votre présence ici :
👇 ${data.invitationUrl}

_— AlmightyService_`
}

// Rappel J-1
export function lastReminderTemplate(data: MessageTemplateData): string {
  return `*${data.guestName}*, c'est demain ! 🎉

Le mariage de *${data.groomName} & ${data.brideName}* a lieu demain :

📅 ${data.eventDate}
🕐 ${data.eventTime}
📍 ${data.venueName}

N'oubliez pas votre QR Code dans votre invitation :
👇 ${data.invitationUrl}

À demain ! 🥂

_— AlmightyService_`
}

// Message jour J
export function dayOfTemplate(data: MessageTemplateData): string {
  return `🎊 *C'est aujourd'hui !*

*${data.guestName}*, le grand jour est arrivé !

Le mariage de *${data.groomName} & ${data.brideName}* commence ce soir à *${data.eventTime}*.

📍 ${data.venueName}

Présentez votre QR Code à l'entrée :
👇 ${data.invitationUrl}

À tout à l'heure ! ✨

_— AlmightyService_`
}

// ── NOUVEAU : Notification RSVP au couple ────────────────────
export function rsvpConfirmationNotification(data: {
  groomName: string
  brideName: string
  guestName: string
  guestSide: 'HOMME' | 'FEMME'
  tableName: string | null
}): string {
  const recipient = data.guestSide === 'HOMME'
    ? `*${data.groomName}*`
    : `*${data.brideName}*`

  return `🎊 Bonne nouvelle ${recipient} !

*${data.guestName}* vient de confirmer sa présence à votre mariage.
${data.tableName ? `\n📍 Table assignée : *${data.tableName}*` : ''}

— AlmightyService`
}