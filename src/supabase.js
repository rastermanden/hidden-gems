import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ptnzegjtpvwlzuvmodac.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0bnplZ2p0cHZ3bHp1dm1vZGFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyMjQ1MjAsImV4cCI6MjA5MDgwMDUyMH0.5febQSFyDSz6R0p-5ctruat6QnJ2aeKNWnnDAFytwfk'

export const db = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { flowType: 'pkce' }
})

export async function toSignedUrl(p) {
  if (!p) return null
  const marker = '/object/public/gem-photos/'
  const path = p.includes(marker) ? p.split(marker)[1] : (p.startsWith('http') ? null : p)
  if (!path) return p
  const { data } = await db.storage.from('gem-photos').createSignedUrl(path, 3600)
  return data?.signedUrl || null
}
