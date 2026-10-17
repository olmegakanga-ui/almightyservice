export interface SendSmsResult {
  success: boolean
  messageId?: string
  error?: string
}

interface AfricaTalkingRecipient {
  statusCode?: number
  status?: string
  messageId?: string
}

interface AfricaTalkingResponse {
  SMSMessageData?: {
    Message?: string
    Recipients?: AfricaTalkingRecipient[]
  }
}

export function isSmsConfigured(): boolean {
  return Boolean(
    process.env.AFRICASTALKING_USERNAME
    && process.env.AFRICASTALKING_API_KEY
    && process.env.AFRICASTALKING_SENDER_ID
  )
}

function normalizePhone(phone: string): string {
  const defaultCountryCode = process.env.SMS_DEFAULT_COUNTRY_CODE ?? '243'
  const raw = phone.trim()
  const digits = raw.replace(/\D/g, '')

  if (raw.startsWith('+')) return `+${digits}`
  if (digits.startsWith('00')) return `+${digits.slice(2)}`
  if (digits.startsWith(defaultCountryCode)) return `+${digits}`
  if (digits.startsWith('0')) return `+${defaultCountryCode}${digits.slice(1)}`
  return `+${digits}`
}

export async function sendSmsMessage(to: string, message: string): Promise<SendSmsResult> {
  const username = process.env.AFRICASTALKING_USERNAME
  const apiKey = process.env.AFRICASTALKING_API_KEY
  const senderId = process.env.AFRICASTALKING_SENDER_ID

  if (!username || !apiKey || !senderId) {
    return { success: false, error: 'Configuration Africa’s Talking incomplète' }
  }

  const isSandbox = process.env.AFRICASTALKING_ENV === 'sandbox'
  const endpoint = isSandbox
    ? 'https://api.sandbox.africastalking.com/version1/messaging'
    : 'https://api.africastalking.com/version1/messaging'

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        apiKey,
      },
      body: new URLSearchParams({
        username,
        to: normalizePhone(to),
        message,
        from: senderId,
      }).toString(),
    })

    const data = await response.json() as AfricaTalkingResponse
    const recipient = data.SMSMessageData?.Recipients?.[0]
    const accepted = recipient?.statusCode !== undefined
      && [100, 101, 102].includes(recipient.statusCode)

    if (!response.ok || !accepted) {
      return {
        success: false,
        error: recipient?.status
          ?? data.SMSMessageData?.Message
          ?? `Erreur Africa’s Talking (${response.status})`,
      }
    }

    return {
      success: true,
      messageId: recipient.messageId,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur réseau SMS',
    }
  }
}
