# AgentAuth

<div align="center">
  <img src="https://agentauth.dev/logo.png" alt="AgentAuth Logo" width="80" />
  <h3>OAuth infrastructure for AI agents</h3>
  <p>Your agent needs user permissions. We handle the tokens.</p>
  
  [![npm version](https://badge.fury.io/js/agentauth.svg)](https://www.npmjs.com/package/agentauth)
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
</div>

---

## The Problem

When your AI agent needs to access user data (Gmail, Calendar, Drive), you need OAuth tokens for every single user. That means building:

- OAuth consent flows
- Secure token storage
- Automatic token refresh
- Expiration handling

For one service. Then repeat for every integration.

## The Solution

**Three lines of code:**

```javascript
const { AgentAuth } = require('agentauth')
const auth = new AgentAuth('your-api-key')

// Get a valid token anytime
const token = await auth.getToken('user_123', 'google')
// Token is always valid. We handle refresh.
```

## Features

- 🔐 **AES-256 encryption** for all tokens at rest
- 🔄 **Auto-refresh** before token expiry
- 🏷️ **White-label** with your own OAuth app
- 📦 **Simple API** with just 2 main methods
- 🔑 **TypeScript** support with full types

## Quick Start

### 1. Install the SDK

```bash
npm install agentauth
```

### 2. Get your API key

Sign up at [agentauth.dev](https://agentauth.dev) and grab your API key from the dashboard.

### 3. Add your Google credentials

Add your Google OAuth Client ID and Secret in the dashboard.

### 4. Start building

```javascript
import { AgentAuth } from 'agentauth'

const auth = new AgentAuth('aa_live_xxxxxxxx')

// Generate a connect URL for your user
const url = await auth.getConnectUrl({
  userId: 'user_123',
  service: 'google',
  scopes: ['gmail.send'],
  redirectUrl: 'https://yourapp.com/connected'
})

// Redirect your user to this URL
// They'll see Google's consent screen

// After they connect, get their token anytime
const token = await auth.getToken('user_123', 'google')

// Use the token with Google APIs
const response = await fetch('https://gmail.googleapis.com/...', {
  headers: { Authorization: `Bearer ${token}` }
})
```

## Available Scopes

| Scope | Description |
|-------|-------------|
| `gmail.readonly` | Read emails |
| `gmail.send` | Send emails |
| `gmail.full` | Full Gmail access |
| `calendar.readonly` | Read calendar events |
| `calendar.write` | Read and write calendar |
| `drive.readonly` | Read Drive files |
| `drive.file` | Read and write Drive files |

## API Reference

### `new AgentAuth(apiKey, options?)`

Create a new AgentAuth client.

```typescript
const auth = new AgentAuth('your-api-key', {
  baseUrl: 'https://agentauth.dev' // optional
})
```

### `auth.getConnectUrl(options)`

Generate a URL for users to connect their Google account.

```typescript
const url = await auth.getConnectUrl({
  userId: 'user_123',      // required: your internal user ID
  service: 'google',       // required: service to connect
  scopes: ['gmail.send'],  // optional: defaults to ['gmail.readonly']
  redirectUrl: 'https://...' // optional: redirect after connection
})
```

### `auth.getToken(userId, service?)`

Get a valid access token. Automatically refreshes if expired.

```typescript
const token = await auth.getToken('user_123', 'google')
```

### `auth.isConnected(userId, service?)`

Check if a user has connected their account.

```typescript
const connected = await auth.isConnected('user_123', 'google')
```

## Error Handling

```javascript
try {
  const token = await auth.getToken('user_123', 'google')
} catch (error) {
  if (error.code === 'user_not_connected') {
    // User needs to connect their account first
    const url = await auth.getConnectUrl({
      userId: 'user_123',
      service: 'google'
    })
    // Redirect user to url
  }
}
```

## Self-Hosting

AgentAuth can be self-hosted. This repo contains the full source code.

### Prerequisites

- Node.js 18+
- Supabase account
- Clerk account
- Resend account (for emails)

### Setup

1. Clone the repo
2. Copy `.env.example` to `.env.local` and fill in your values
3. Run the SQL in `schema.sql` in your Supabase project
4. Install dependencies: `npm install`
5. Run the dev server: `npm run dev`

### Environment Variables

See `.env.example` for all required variables.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **Auth:** Clerk
- **Styling:** Tailwind CSS
- **Email:** Resend
- **Encryption:** AES-256-GCM

## License

MIT

## Support

- Email: hello@agentauth.dev
- Twitter: [@agentauth](https://twitter.com/agentauth)
- GitHub Issues: [Report a bug](https://github.com/agentauth/agentauth/issues)
