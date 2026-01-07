import { SignUp } from '@clerk/nextjs'
import Link from 'next/link'
import { Key } from 'lucide-react'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative">
      {/* Background effects */}
      <div className="fixed inset-0 bg-hero-glow pointer-events-none" />
      <div className="fixed inset-0 noise pointer-events-none" />
      
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-8 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center">
          <Key className="w-5 h-5 text-white" />
        </div>
        <span className="text-2xl font-semibold">
          Agent<span className="text-accent">Auth</span>
        </span>
      </Link>
      
      {/* Clerk Sign Up */}
      <div className="relative z-10">
        <SignUp 
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'bg-card/80 backdrop-blur-xl border border-border shadow-2xl',
            }
          }}
        />
      </div>
    </div>
  )
}
