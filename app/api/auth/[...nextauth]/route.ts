import { handlers } from "@/auth"
import { NextResponse } from "next/server"
import * as userDB from '@/lib/db/users'

// Extend the JWT callback to include user ID
export const { GET, POST } = handlers

// Add session callback to include user ID
export async function session({ session, token }: any) {
  if (session?.user?.email) {
    const dbUser = await userDB.getUserByEmail(session.user.email)
    if (dbUser) {
      session.user.id = dbUser.id
    }
  }
  return session
}