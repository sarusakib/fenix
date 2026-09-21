'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowLeft, ChatCircleText, Check, Flag, PaperPlaneRight, UserCircle } from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/client'
import { useFenixLocale } from '@/components/i18n/FenixLocaleProvider'

type Message = { id:string; sender_id:string; recipient_id:string; body:string; created_at:string; read_at:string|null }
type Person = { id:string; full_name:string|null; username:string|null; avatar_url:string|null }

export default function MessagesPage() {
  const { locale } = useFenixLocale()
  const [userId,setUserId]=useState('')
  const [messages,setMessages]=useState<Message[]>([])
  const [people,setPeople]=useState<Record<string,Person>>({})
  const [to,setTo]=useState('')
  const [recipientName,setRecipientName]=useState('')
  const [body,setBody]=useState('')
  const [busy,setBusy]=useState(false)
  const [status,setStatus]=useState('')

  useEffect(()=>{
    const params=new URLSearchParams(window.location.search)
    setTo(params.get('to')||'')
    setRecipientName(params.get('name')||'')
    void load()
  },[])

  async function load(){
    const s=createClient()
    const [{data:auth},{data,error}]=await Promise.all([
      s.auth.getUser(),
      s.from('fenix_direct_messages').select('id,sender_id,recipient_id,body,created_at,read_at').order('created_at',{ascending:false}).limit(100),
    ])
    if(!auth.user){window.location.replace('/login?next=/messages');return}
    setUserId(auth.user.id)
    if(error){setStatus(locale==='bn'?'Message লোড করা যায়নি।':'Messages could not be loaded.');return}
    const rows=(data??[]) as Message[]
    setMessages(rows)
    const ids=[...new Set(rows.flatMap(m=>[m.sender_id,m.recipient_id]).filter(id=>id!==auth.user.id))]
    if(ids.length){
      const {data:profiles}=await s.from('fenix_public_profiles').select('id,full_name,username,avatar_url').in('id',ids)
      setPeople(Object.fromEntries(((profiles??[]) as Person[]).map(p=>[p.id,p])))
    }
    const unread=rows.filter(m=>m.recipient_id===auth.user.id && !m.read_at).map(m=>m.id)
    if(unread.length) await s.from('fenix_direct_messages').update({read_at:new Date().toISOString()}).in('id',unread)
  }

  async function resolveRecipient(){
    if(to) return to
    const username=recipientName.trim().replace(/^@/,'').toLowerCase()
    if(!username) return ''
    const s=createClient()
    const {data}=await s.from('fenix_public_profiles').select('id,full_name,username,avatar_url').eq('username',username).maybeSingle()
    if(data?.id){setTo(data.id);setPeople(p=>({...p,[data.id as string]:data as Person}));return data.id}
    return ''
  }

  async function send(){
    if(!body.trim()) return
    setBusy(true);setStatus('')
    const recipient=await resolveRecipient()
    if(!recipient){setStatus(locale==='bn'?'Username দিয়ে recipient পাওয়া যায়নি।':'Recipient could not be found by username.');setBusy(false);return}
    if(recipient===userId){setStatus(locale==='bn'?'নিজেকে message পাঠানো যাবে না।':'You cannot message yourself.');setBusy(false);return}
    const s=createClient()
    const {error}=await s.from('fenix_direct_messages').insert({sender_id:userId,recipient_id:recipient,body:body.trim().slice(0,5000)})
    if(error){setStatus(error.code==='42501' ? (locale==='bn'?'এই user message নেওয়া বন্ধ রেখেছেন।':'This user is not accepting messages.') : (locale==='bn'?'Message পাঠানো যায়নি।':'Message could not be sent.'))}
    else {setBody('');setStatus(locale==='bn'?'Message পাঠানো হয়েছে।':'Message sent.');await load()}
    setBusy(false)
  }

  async function reportMessage(messageId:string) {
    const reason = window.prompt(locale==='bn' ? 'Message-এ কী সমস্যা হয়েছে? সংক্ষেপে লিখুন:' : 'What is the problem with this message?')
    if (!reason?.trim()) return
    const s=createClient()
    const {data:auth}=await s.auth.getUser()
    if(!auth.user) return
    const {error}=await s.from('fenix_content_reports').insert({
      reporter_id:auth.user.id, content_type:'message', content_id:messageId,
      reason:reason.trim().slice(0,120), details:reason.trim().slice(0,2000),
    })
    setStatus(error ? (locale==='bn'?'Message report পাঠানো যায়নি।':'Could not report the message.') : (locale==='bn'?'Message report admin review queue-তে গেছে।':'Message report sent to the admin review queue.'))
  }

  const counterpart=(m:Message)=>m.sender_id===userId?people[m.recipient_id]:people[m.sender_id]
  const title=locale==='bn'?'মেসেজ':'Messages'

  return <main className="min-h-dvh">
    <Navbar/>
    <section className="mx-auto max-w-4xl px-4 pb-28 pt-7 sm:px-6">
      <Link href="/dashboard" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--fx-border)] px-3.5 text-xs font-bold"><ArrowLeft size={16}/> Account</Link>
      <div className="mt-6"><p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--fx-primary-strong)]">Inbox</p><h1 className="mt-2 text-3xl font-black sm:text-5xl">{title}</h1><p className="mt-3 text-sm leading-7 text-[var(--fx-muted)]">{locale==='bn'?'Profile থেকে সরাসরি বা username দিয়ে নিরাপদভাবে message পাঠাতে পারবেন।':'Send a protected direct message from a profile or by username.'}</p></div>

      <section className="mt-6 rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5">
        <div className="flex items-center gap-2"><ChatCircleText size={21} className="text-[var(--fx-primary-strong)]"/><h2 className="font-black">{locale==='bn'?'নতুন message':'New message'}</h2></div>
        <input value={recipientName} onChange={e=>{setRecipientName(e.target.value);setTo('')}} placeholder={locale==='bn'?'Username যেমন sakib_01':'Username, e.g. sakib_01'} className="mt-4 h-11 w-full rounded-xl border border-[var(--fx-border)] bg-transparent px-3 text-sm"/>
        <textarea value={body} onChange={e=>setBody(e.target.value)} maxLength={5000} rows={4} placeholder={locale==='bn'?'আপনার message লিখুন':'Write your message'} className="mt-3 w-full rounded-xl border border-[var(--fx-border)] bg-transparent p-3 text-sm leading-6"/>
        <div className="mt-3 flex items-center justify-between gap-3"><span className="text-[10px] text-[var(--fx-muted)]">{body.length}/5000</span><button type="button" disabled={busy||!body.trim()} onClick={()=>void send()} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--fx-primary-strong)] px-4 text-sm font-bold text-white disabled:opacity-45"><PaperPlaneRight size={16}/> Send</button></div>
      </section>

      {status&&<p className="mt-3 rounded-xl bg-[var(--fx-primary-soft)] p-3 text-sm">{status}</p>}

      <section className="mt-6 space-y-3">
        {messages.length?messages.map(m=>{
          const p=counterpart(m)
          return <article key={m.id} className="rounded-[1.7rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5">
            <div className="flex items-start gap-3">
              {p?.avatar_url?<img src={p.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover"/>:<UserCircle size={40} className="shrink-0 opacity-35"/>}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2"><Link href={p?.username?`/profile/${p.username}`:'/profile'} className="font-bold hover:underline">{p?.full_name||p?.username||'FeniX user'}</Link><span className="text-[11px] text-[var(--fx-muted)]">{new Date(m.created_at).toLocaleString(locale==='bn'?'bn-BD':'en-BD')}</span></div>
                <p className="mt-1 text-[11px] text-[var(--fx-muted)]">@{p?.username||'user'}</p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7">{m.body}</p>
                {m.recipient_id===userId&&<span className="mt-3 inline-flex items-center gap-1 text-[10px] text-[var(--fx-muted)]"><Check size={13}/> Read</span>}
                <button type="button" onClick={()=>void reportMessage(m.id)} className="mt-3 inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[var(--fx-border)] px-3 text-[10px] font-bold text-red-700 dark:text-red-300"><Flag size={13}/> {locale==='bn'?'Report':'Report'}</button>
              </div>
            </div>
          </article>
        }):<div className="rounded-[1.7rem] border border-dashed border-[var(--fx-border)] p-10 text-center text-sm text-[var(--fx-muted)]">No messages yet.</div>}
      </section>
    </section>
  </main>
}