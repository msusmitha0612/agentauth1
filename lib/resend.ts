import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendWelcomeEmail(params: {
  email: string
  firstName: string
}) {
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
  
  try {
    await resend.emails.send({
      from: 'AgentAuth <hello@agentauth.dev>',
      to: params.email,
      subject: 'Welcome to AgentAuth',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; }
              .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
              .logo { font-size: 24px; font-weight: bold; margin-bottom: 30px; }
              .logo span { color: #6366f1; }
              h1 { font-size: 28px; margin-bottom: 20px; }
              .code-block { background: #1a1a1a; color: #e5e5e5; padding: 20px; border-radius: 8px; font-family: monospace; font-size: 14px; margin: 20px 0; }
              .code-block .comment { color: #6b7280; }
              .code-block .keyword { color: #c084fc; }
              .code-block .string { color: #34d399; }
              .steps { margin: 30px 0; }
              .step { display: flex; gap: 15px; margin-bottom: 15px; }
              .step-number { background: #6366f1; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; flex-shrink: 0; }
              .btn { display: inline-block; background: #6366f1; color: white !important; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
              .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e5e5; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="logo">Agent<span>Auth</span></div>
              
              <h1>Welcome, ${params.firstName}!</h1>
              
              <p>You're ready to start managing OAuth tokens for your AI agents. Here's how to get started:</p>
              
              <div class="steps">
                <div class="step">
                  <div class="step-number">1</div>
                  <div>Add your Google OAuth credentials in the dashboard</div>
                </div>
                <div class="step">
                  <div class="step-number">2</div>
                  <div>Generate your API key</div>
                </div>
                <div class="step">
                  <div class="step-number">3</div>
                  <div>Start building!</div>
                </div>
              </div>
              
              <a href="${dashboardUrl}" class="btn">Go to Dashboard</a>
              
              <div class="code-block">
                <div><span class="comment">// Quick start code</span></div>
                <div><span class="keyword">npm install</span> agentauth</div>
                <br/>
                <div><span class="keyword">const</span> { AgentAuth } = <span class="keyword">require</span>(<span class="string">'agentauth'</span>)</div>
                <div><span class="keyword">const</span> auth = <span class="keyword">new</span> AgentAuth(<span class="string">'your-api-key'</span>)</div>
                <br/>
                <div><span class="keyword">const</span> url = auth.getConnectUrl({ userId: <span class="string">'user_1'</span>, service: <span class="string">'google'</span> })</div>
                <div><span class="keyword">const</span> token = <span class="keyword">await</span> auth.getToken(<span class="string">'user_1'</span>, <span class="string">'google'</span>)</div>
              </div>
              
              <p>Need help? Reply to this email or check out our <a href="${process.env.NEXT_PUBLIC_APP_URL}/docs">documentation</a>.</p>
              
              <p>Happy building!<br/>The AgentAuth Team</p>
              
              <div class="footer">
                <p>© 2025 AgentAuth. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `
    })
    
    return { success: true }
  } catch (error) {
    console.error('Failed to send welcome email:', error)
    return { success: false, error }
  }
}
