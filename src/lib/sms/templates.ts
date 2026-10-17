export interface J1SmsTemplateData {
  guestName: string
  groomName: string
  brideName: string
  eventTime: string
  venueName: string
}

// En GSM-7, un SMS multipart contient 153 caractères par segment.
// Trois segments représentent donc au maximum 459 caractères.
export const MAX_J1_SMS_CHARACTERS = 459

function gsmSafe(value: string): string {
  return value
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x0A\x0D\x20-\x7E]/g, '')
    .replace(/[ \t]+/g, ' ')
    .trim()
}

export function smsSegmentCount(message: string): number {
  const length = gsmSafe(message).length
  if (length <= 160) return 1
  return Math.ceil(length / 153)
}

export function j1SmsTemplate(data: J1SmsTemplateData): string {
  const message = gsmSafe(`Bonjour ${data.guestName},

Nous vous rappelons que le mariage de ${data.groomName} et ${data.brideName} aura lieu demain.

Lieu : ${data.venueName}
Heure : ${data.eventTime}

Nous serons heureux de vous compter parmi nous. Merci de vous presenter avec votre invitation.

Cordialement,
AlmightyService`)

  if (message.length <= MAX_J1_SMS_CHARACTERS) return message

  // Cas exceptionnel de noms ou lieu très longs : rester strictement sous
  // trois segments tout en conservant la signature de l'expéditeur.
  const signature = '\n\nCordialement,\nAlmightyService'
  return message.slice(0, MAX_J1_SMS_CHARACTERS - signature.length - 3).trimEnd()
    + '...'
    + signature
}
