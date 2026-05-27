export interface SendMessageResult {
  success: boolean
  messageId?: string
  error?: string
}

export interface WhatsAppConfig {
  provider: 'meta' | 'twilio' | 'mock'
  // Meta
  metaToken?: string
  metaPhoneNumberId?: string
  // Twilio
  twilioAccountSid?: string
  twilioAuthToken?: string
  twilioFromNumber?: string
}

function getConfig(): WhatsAppConfig {
  const provider = (process.env.WHATSAPP_PROVIDER ?? 'mock') as WhatsAppConfig['provider']
  return {
    provider,
    metaToken:          process.env.WHATSAPP_META_TOKEN,
    metaPhoneNumberId:  process.env.WHATSAPP_META_PHONE_ID,
    twilioAccountSid:   process.env.TWILIO_ACCOUNT_SID,
    twilioAuthToken:    process.env.TWILIO_AUTH_TOKEN,
    twilioFromNumber:   process.env.TWILIO_FROM_NUMBER,
  }
}

// ── META WhatsApp Cloud API ──────────────────────────────────
async function sendViaMeta(
  to: string,
  message: string,
  config: WhatsAppConfig
): Promise<SendMessageResult> {
  if (!config.metaToken || !config.metaPhoneNumberId) {
    return { success: false, error: 'Meta credentials manquants' }
  }

  // Formate le numéro — enlève le + et les espaces
  const phone = to.replace(/[^0-9]/g, '')

  try {
    const res = await fetch(
      `https://graph.facebook.com/v18.0/${config.metaPhoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.metaToken}`,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to:                phone,
          type:              'text',
          text:              { body: message },
        }),
      }
    )

    const data = await res.json()

    if (!res.ok) {
      return {
        success: false,
        error: data.error?.message ?? 'Erreur Meta API',
      }
    }

    return {
      success:   true,
      messageId: data.messages?.[0]?.id,
    }
  } catch (err) {
    return {
      success: false,
      error:   err instanceof Error ? err.message : 'Erreur réseau',
    }
  }
}

// ── TWILIO WhatsApp ──────────────────────────────────────────
async function sendViaTwilio(
  to: string,
  message: string,
  config: WhatsAppConfig
): Promise<SendMessageResult> {
  if (!config.twilioAccountSid || !config.twilioAuthToken || !config.twilioFromNumber) {
    return { success: false, error: 'Twilio credentials manquants' }
  }

  const phone = 'whatsapp:+' + to.replace(/[^0-9]/g, '')
  const from  = config.twilioFromNumber.startsWith('whatsapp:')
    ? config.twilioFromNumber
    : 'whatsapp:' + config.twilioFromNumber

  try {
    const credentials = Buffer.from(
      `${config.twilioAccountSid}:${config.twilioAuthToken}`
    ).toString('base64')

    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${config.twilioAccountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type':  'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: from,
          To:   phone,
          Body: message,
        }).toString(),
      }
    )

    const data = await res.json()

    if (!res.ok) {
      return {
        success: false,
        error: data.message ?? 'Erreur Twilio',
      }
    }

    return {
      success:   true,
      messageId: data.sid,
    }
  } catch (err) {
    return {
      success: false,
      error:   err instanceof Error ? err.message : 'Erreur réseau',
    }
  }
}

// ── MOCK (développement/test) ────────────────────────────────
async function sendViaMock(
  to: string,
  message: string
): Promise<SendMessageResult> {
  console.log('═══════════════════════════════════')
  console.log('📱 WhatsApp MOCK — Envoi simulé')
  console.log('À :', to)
  console.log('Message :')
  console.log(message)
  console.log('═══════════════════════════════════')

  // Simule un délai réseau
  await new Promise(r => setTimeout(r, 500))

  return {
    success:   true,
    messageId: 'mock_' + Date.now(),
  }
}

// ── FONCTION PRINCIPALE ──────────────────────────────────────
export async function sendWhatsAppMessage(
  to: string,
  message: string
): Promise<SendMessageResult> {
  const config = getConfig()

  switch (config.provider) {
    case 'meta':
      return sendViaMeta(to, message, config)
    case 'twilio':
      return sendViaTwilio(to, message, config)
    case 'mock':
    default:
      return sendViaMock(to, message)
  }
}