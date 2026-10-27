import { createHmac, timingSafeEqual } from 'node:crypto'

const TOKEN_SCOPE = 'chat:orders:read'
const TOKEN_TTL_SECONDS = 15 * 60

type OrderTokenPayload = {
  sub: string
  scope: typeof TOKEN_SCOPE
  exp: number
}

function getSecret() {
  const secret = process.env.BOTPRESS_ORDER_TOKEN_SECRET
  return secret && secret.length >= 32 ? secret : null
}

function sign(value: string, secret: string) {
  return createHmac('sha256', secret).update(value).digest('base64url')
}

export function issueChatOrderToken(userId: string) {
  const secret = getSecret()
  if (!secret) return null

  const payload: OrderTokenPayload = {
    sub: userId,
    scope: TOKEN_SCOPE,
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
  }
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const content = `v1.${encodedPayload}`
  return `${content}.${sign(content, secret)}`
}

export function verifyChatOrderToken(token: string): string | null {
  const secret = getSecret()
  if (!secret) return null

  const [version, encodedPayload, signature, extra] = token.split('.')
  if (version !== 'v1' || !encodedPayload || !signature || extra) return null

  const content = `${version}.${encodedPayload}`
  const expected = Buffer.from(sign(content, secret))
  const actual = Buffer.from(signature)
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString()) as Partial<OrderTokenPayload>
    if (
      typeof payload.sub !== 'string' ||
      payload.scope !== TOKEN_SCOPE ||
      typeof payload.exp !== 'number' ||
      payload.exp <= Math.floor(Date.now() / 1000)
    ) return null
    return payload.sub
  } catch {
    return null
  }
}
