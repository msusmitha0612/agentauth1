const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'

export const SCOPE_MAP: Record<string, string> = {
  'gmail.send': 'https://www.googleapis.com/auth/gmail.send',
  'gmail.readonly': 'https://www.googleapis.com/auth/gmail.readonly',
  'gmail.full': 'https://mail.google.com/',
  'calendar.readonly': 'https://www.googleapis.com/auth/calendar.readonly',
  'calendar.write': 'https://www.googleapis.com/auth/calendar',
  'drive.readonly': 'https://www.googleapis.com/auth/drive.readonly',
  'drive.file': 'https://www.googleapis.com/auth/drive.file',
}

export const SCOPE_DESCRIPTIONS: Record<string, string> = {
  'gmail.send': 'Send emails',
  'gmail.readonly': 'Read emails',
  'gmail.full': 'Full Gmail access',
  'calendar.readonly': 'Read calendar',
  'calendar.write': 'Read and write calendar',
  'drive.readonly': 'Read Drive files',
  'drive.file': 'Read and write Drive files',
}

export function buildAuthUrl(params: {
  clientId: string
  redirectUri: string
  scopes: string[]
  state: string
}): string {
  const googleScopes = params.scopes.map(s => SCOPE_MAP[s] || s).join(' ')
  
  const url = new URL(GOOGLE_AUTH_URL)
  url.searchParams.set('client_id', params.clientId)
  url.searchParams.set('redirect_uri', params.redirectUri)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', googleScopes)
  url.searchParams.set('state', params.state)
  url.searchParams.set('access_type', 'offline')
  url.searchParams.set('prompt', 'consent')
  
  return url.toString()
}

export async function exchangeCodeForTokens(params: {
  code: string
  clientId: string
  clientSecret: string
  redirectUri: string
}): Promise<{
  accessToken: string
  refreshToken: string
  expiresIn: number
  scope: string
}> {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code: params.code,
      client_id: params.clientId,
      client_secret: params.clientSecret,
      redirect_uri: params.redirectUri,
      grant_type: 'authorization_code',
    }),
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Token exchange failed: ${error}`)
  }
  
  const data = await response.json()
  
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    scope: data.scope,
  }
}

export async function refreshAccessToken(params: {
  refreshToken: string
  clientId: string
  clientSecret: string
}): Promise<{
  accessToken: string
  expiresIn: number
}> {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: params.refreshToken,
      client_id: params.clientId,
      client_secret: params.clientSecret,
      grant_type: 'refresh_token',
    }),
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Token refresh failed: ${error}`)
  }
  
  const data = await response.json()
  
  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
  }
}

export function parseScopesFromGoogle(googleScope: string): string[] {
  const reverseMap: Record<string, string> = {}
  for (const [key, value] of Object.entries(SCOPE_MAP)) {
    reverseMap[value] = key
  }
  
  return googleScope.split(' ').map(s => reverseMap[s] || s).filter(Boolean)
}
