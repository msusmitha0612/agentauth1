'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Check, Code2, Key, RefreshCw, Shield, Zap, Github, Twitter, Mail, ChevronRight } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
}

const stagger = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function LandingPage() {
  const heroCode = `const token = await agentauth.getToken('user_123', 'google')
// Token is always valid. We handle refresh.`

  const solutionCode = `// Generate a URL for your user to connect
const url = agentauth.getConnectUrl({ 
  userId: 'user_123', 
  service: 'google',
  scopes: ['gmail.send']
})

// After they connect, get their token anytime
const token = await agentauth.getToken('user_123', 'google')

// Token is always valid. Use it with Google APIs.`

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 bg-hero-glow pointer-events-none" />
      <div className="fixed inset-0 noise pointer-events-none" />
      
      {/* Animated gradient orbs */}
      <div className="fixed top-1/4 -left-32 w-96 h-96 bg-accent/20 rounded-full blur-[128px] animate-pulse-glow" />
      <div className="fixed bottom-1/4 -right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-[128px] animate-pulse-glow animate-delay-500" />

      {/* Navigation */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-50 border-b border-border/50"
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center">
              <Key className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-semibold">
              Agent<span className="text-accent">Auth</span>
            </span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link href="/docs" className="btn-ghost text-sm">
              Docs
            </Link>
            <Link href="/sign-in" className="btn-ghost text-sm">
              Sign in
            </Link>
            <Link href="/sign-up" className="btn-primary text-sm !px-4 !py-2">
              Get started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-32">
        <motion.div 
          initial="initial"
          animate="animate"
          variants={stagger}
          className="text-center"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm mb-8">
            <Zap className="w-4 h-4" />
            Now in public beta
          </motion.div>
          
          <motion.h1 
            variants={fadeInUp}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-balance"
          >
            OAuth infrastructure
            <br />
            <span className="gradient-text-accent">for AI agents</span>
          </motion.h1>
          
          <motion.p 
            variants={fadeInUp}
            className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Your agent needs user permissions. We handle the tokens.
            <br />
            Storage, encryption, refresh. All managed.
          </motion.p>

          <motion.div variants={fadeInUp} className="max-w-xl mx-auto mb-12">
            <div className="code-block glow">
              <SyntaxHighlighter
                language="javascript"
                style={vscDarkPlus}
                customStyle={{ 
                  background: 'transparent', 
                  padding: '1.25rem',
                  margin: 0,
                  fontSize: '0.9rem'
                }}
              >
                {heroCode}
              </SyntaxHighlighter>
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} className="flex items-center justify-center gap-4">
            <Link href="/sign-up" className="btn-primary text-base">
              Start building free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/docs" className="btn-secondary text-base">
              View documentation
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Problem/Solution Section */}
      <section className="relative z-10 py-24 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Problem */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
                The problem
              </div>
              
              <h2 className="text-3xl font-bold mb-6">
                OAuth is a pain
              </h2>
              
              <p className="text-muted-foreground mb-6">
                When your AI agent needs to:
              </p>
              
              <ul className="space-y-3 mb-8">
                {[
                  'Send emails from a user\'s Gmail',
                  'Read a user\'s Google Calendar',
                  'Access a user\'s Google Drive'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-muted-foreground">
                    <ChevronRight className="w-4 h-4 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>
              
              <p className="text-muted-foreground mb-6">
                You need OAuth tokens. For every single user. That means building:
              </p>
              
              <ul className="space-y-3">
                {[
                  'OAuth consent flows',
                  'Secure token storage',
                  'Automatic token refresh',
                  'Expiration handling'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
                      <span className="text-red-400 text-xs">✕</span>
                    </div>
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Solution */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm mb-6">
                The solution
              </div>
              
              <h2 className="text-3xl font-bold mb-6">
                Three lines of code
              </h2>
              
              <div className="code-block glow-sm mb-6">
                <SyntaxHighlighter
                  language="javascript"
                  style={vscDarkPlus}
                  customStyle={{ 
                    background: 'transparent', 
                    padding: '1.25rem',
                    margin: 0,
                    fontSize: '0.85rem'
                  }}
                >
                  {solutionCode}
                </SyntaxHighlighter>
              </div>
              
              <p className="text-muted-foreground">
                We handle storage, encryption, and refresh. <span className="text-foreground font-medium">You ship faster.</span>
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 py-24 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">How it works</h2>
            <p className="text-muted-foreground text-lg">Four steps to OAuth bliss</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                icon: Key,
                title: 'Add credentials',
                description: 'Add your Google OAuth credentials to the dashboard'
              },
              {
                step: '02',
                icon: Code2,
                title: 'Generate URLs',
                description: 'Generate connect URLs for your users with one API call'
              },
              {
                step: '03',
                icon: Shield,
                title: 'Users connect',
                description: 'Users see Google\'s consent screen and approve access'
              },
              {
                step: '04',
                icon: RefreshCw,
                title: 'Get tokens',
                description: 'Get valid tokens anytime. Auto-refresh included.'
              }
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative p-6 rounded-2xl bg-card border border-border card-hover shine"
              >
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center text-accent text-sm font-mono font-bold">
                  {item.step}
                </div>
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  <item.icon className="w-6 h-6 text-muted-foreground group-hover:text-accent transition-colors" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-24 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Built for developers</h2>
            <p className="text-muted-foreground text-lg">Everything you need, nothing you don't</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: 'AES-256 encryption',
                description: 'All tokens encrypted at rest with enterprise-grade security'
              },
              {
                icon: RefreshCw,
                title: 'Auto refresh',
                description: 'Tokens automatically refresh before expiry. Always valid.'
              },
              {
                icon: Zap,
                title: 'Simple API',
                description: 'Two endpoints. getConnectUrl() and getToken(). That\'s it.'
              },
              {
                icon: Code2,
                title: 'TypeScript SDK',
                description: 'Fully typed SDK with IntelliSense support'
              },
              {
                icon: Key,
                title: 'Your OAuth app',
                description: 'Users see your app name, not ours. Full white-label.'
              },
              {
                icon: Check,
                title: 'Multiple scopes',
                description: 'Gmail, Calendar, Drive. Request what you need.'
              }
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-card/50 border border-border card-hover"
              >
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5 text-accent" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24 border-t border-border/50">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-12 rounded-3xl bg-gradient-to-br from-accent/10 via-card to-purple-500/10 border border-accent/20 glow"
          >
            <h2 className="text-4xl font-bold mb-4">Start building in 5 minutes</h2>
            <p className="text-muted-foreground text-lg mb-8">
              Free while in beta. No credit card required.
            </p>
            <Link href="/sign-up" className="btn-primary text-base">
              Get started free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center">
                <Key className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-semibold">
                Agent<span className="text-accent">Auth</span>
              </span>
            </div>
            
            <div className="flex items-center gap-6">
              <Link href="/docs" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                Documentation
              </Link>
              <Link href="https://github.com" target="_blank" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="w-5 h-5" />
              </Link>
              <Link href="https://twitter.com" target="_blank" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="mailto:hello@agentauth.dev" className="text-muted-foreground hover:text-foreground transition-colors">
                <Mail className="w-5 h-5" />
              </Link>
            </div>
            
            <p className="text-muted-foreground text-sm">
              © 2025 AgentAuth. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
