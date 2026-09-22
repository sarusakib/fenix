import { NextResponse } from 'next/server'
import { createClient } from '../../../../utils/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const messageId = new URL(request.url).searchParams.get('message')?.trim()
  if (!messageId) return NextResponse.json({ error: 'Missing message.' }, { status: 400 })

  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

  const { data: message, error } = await supabase
    .from('fenix_direct_messages')
    .select('attachment_path,sender_id,recipient_id')
    .eq('id', messageId)
    .maybeSingle()

  if (error || !message?.attachment_path) {
    return NextResponse.json({ error: 'Media not found.' }, { status: 404 })
  }

  if (message.sender_id !== auth.user.id && message.recipient_id !== auth.user.id) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  }

  const { data: signed, error: signError } = await supabase
    .storage
    .from('chat-media')
    .createSignedUrl(message.attachment_path, 120)

  if (signError || !signed?.signedUrl) {
    return NextResponse.json({ error: 'Media unavailable.' }, { status: 404 })
  }

  return NextResponse.redirect(signed.signedUrl, { status: 302 })
}
