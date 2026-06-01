import { SignJWT, jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(
  process.env.QR_SECRET ?? 'almightyservice-qr-secret-2026-super-long-key'
)

// Générer un JWT pour un invité
export async function signQRToken(payload: {
  token:   string
  guestId: string
  eventId: string
}): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .setIssuer('almightyservice')
    .sign(SECRET)
}

// Vérifier et décoder un JWT scanné
export async function verifyQRToken(jwt: string): Promise<{
  token:   string
  guestId: string
  eventId: string
} | null> {
  try {
    const { payload } = await jwtVerify(jwt, SECRET, {
      issuer: 'almightyservice',
    })
    return payload as {
      token:   string
      guestId: string
      eventId: string
    }
  } catch {
    return null
  }
}