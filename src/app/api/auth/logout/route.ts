import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()

  // Sign out from Supabase
  await supabase.auth.signOut()

  const redirectUrl = req.nextUrl.clone()
  redirectUrl.pathname = '/'
  return NextResponse.redirect(redirectUrl)
}
