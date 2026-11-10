// A stand-in for Google's sign-in, for end-to-end tests only. It runs the real flow:
// authorization redirect, PKCE-checked code exchange, and an RS256 ID token checked against JWKS.
// Tests choose who "signs in" with POST /identity.
import { createHash, randomUUID } from 'node:crypto'
import { createServer } from 'node:http'
import { SignJWT, exportJWK, generateKeyPair } from 'jose'

const port = Number(process.env.STUB_GOOGLE_PORT ?? 3101)
const issuer = `http://127.0.0.1:${port}`
const { publicKey, privateKey } = await generateKeyPair('RS256')
const jwk = { ...(await exportJWK(publicKey)), kid: 'stub', alg: 'RS256', use: 'sig' }

let identity = null
const codes = new Map()

const readBody = async (request) => {
  let body = ''
  for await (const chunk of request) body += chunk
  return body
}

const sendJson = (response, status, data) => {
  response.writeHead(status, { 'Content-Type': 'application/json' })
  response.end(JSON.stringify(data))
}

createServer(async (request, response) => {
  const url = new URL(request.url, issuer)

  if (url.pathname === '/health') return sendJson(response, 200, { ok: true })

  if (url.pathname === '/identity') {
    identity = JSON.parse(await readBody(request))
    return sendJson(response, 200, { ok: true })
  }

  if (url.pathname === '/jwks') return sendJson(response, 200, { keys: [jwk] })

  if (url.pathname === '/authorize') {
    const code = randomUUID()
    codes.set(code, {
      identity,
      nonce: url.searchParams.get('nonce'),
      challenge: url.searchParams.get('code_challenge'),
      clientId: url.searchParams.get('client_id'),
    })
    const callback = new URL(url.searchParams.get('redirect_uri'))
    callback.searchParams.set('code', code)
    callback.searchParams.set('state', url.searchParams.get('state'))
    response.writeHead(302, { Location: callback.href })
    return response.end()
  }

  if (url.pathname === '/token') {
    const form = new URLSearchParams(await readBody(request))
    const grant = codes.get(form.get('code'))
    codes.delete(form.get('code'))
    const challenge = createHash('sha256').update(form.get('code_verifier') ?? '').digest('base64url')
    if (!grant || grant.challenge !== challenge) {
      return sendJson(response, 400, { error: 'invalid_grant' })
    }

    const idToken = await new SignJWT({
      nonce: grant.nonce,
      email: grant.identity.email,
      email_verified: grant.identity.emailVerified,
      name: grant.identity.name,
    })
      .setProtectedHeader({ alg: 'RS256', kid: 'stub' })
      .setIssuer(issuer)
      .setAudience(grant.clientId)
      .setSubject(grant.identity.sub)
      .setIssuedAt()
      .setExpirationTime('5m')
      .sign(privateKey)
    return sendJson(response, 200, { id_token: idToken })
  }

  sendJson(response, 404, { error: 'not_found' })
}).listen(port, '127.0.0.1')
