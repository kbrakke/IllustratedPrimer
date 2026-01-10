'use client'

import { signIn } from "next-auth/react"

export default function SignIn() {
  return (
    <button
      onClick={() => signIn("google")}
      className="px-4 py-2 text-primer-primary bg-primer-lightest border border-primer-dark rounded-lg hover:bg-primer-light transition-colors"
      title="Sign in to create and manage your stories"
    >
      Sign in with Google
    </button>
  )
}