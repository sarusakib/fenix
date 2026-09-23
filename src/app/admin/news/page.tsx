'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowLeft, FloppyDisk, Newspaper, PencilSimple, Plus, Trash, X } from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/client'

type Post = {
  id:string; slug:string; title_bn:string; title_en:string; excerpt_bn:string|null; excerpt_en:string|null;
  content_bn:string; content_en:string; category:string; status:string; featured:boolean; breaking:boolean;
  source_name:string|null; source_url:string|null; verification_status:string; image_url:string|null; published_at:string|null
}
const empty: Omit<Post,'id'|'published_at'> = {
  slug:'',title_bn:'',title_en:'',excerpt_bn:'',excerpt_en:'',content_bn:'',content_en:'',
  category:'local',status:'draft',featured:false,breaking:false,source_name:'FeniX News Desk',
  source_url:'',verification_status:'editor_reviewed',image_url:''
}
const cats=[['local','Local'],['business','Business'],['jobs','Jobs'],['events','Events'],['public_notice','Public Notice'],['fenix','FeniX Update']]
export default function NewsAdminPage(){
 const [allowed,setAllowed]=useState<boolean|null>(null); const [posts,setPosts]=useState<Post[]>([])
 const [form,setForm]=useState<any>(empty); const [editing,setEditing]=useState<string|null>(null); const [message,setMessage]=useState(''); const [busy,setBusy]=useState(false)
 useEffect(()=>{void load()},[])
 async function load(){
  const s=createClient() as any
  const {data:admin}=await s.rpc('is_fenix_admin'); setAllowed(Boolean(admin)); if(!admin)return
  const {data,error}=await s.from('news_posts').select('*').order('created_at',{ascending:false}).limit(100)
  if(error)setMessage('News database is not connected to this deployment yet.'); else setPosts(data??[])
 }
 function patch(k:string,v:any){setForm((x:any)=>({...x,[k]:v}))}
 function start(post?:Post){setEditing(post?.id??null);setForm(post?{...post}: {...empty});setMessage('');window.scrollTo({top:0,behavior:'smooth'})}
 async function save(){
  if(!form.slug.trim()||!form.title_en.trim()||!form.title_bn.trim()||form.content_en.trim().length<20||form.content_bn.trim().length<20){setMessage('Title, slug and both article bodies are required.');return}
  setBusy(true);setMessage(''); const s=createClient() as any
  const payload={...form,slug:form.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g,'-').replace(/^-+|-+$/g,''),source_url:form.source_url?.trim()||null,image_url:form.image_url?.trim()||null}
  const result=editing ? await s.from('news_posts').update(payload).eq('id',editing) : await s.from('news_posts').insert(payload)
  if(result.error)setMessage(result.error.message); else {setMessage(form.status==='published'?'Published to public News.':'Saved.');setEditing(null);setForm({...empty});await load()}
  setBusy(false)
 }
 async function remove(id:string){if(!confirm('Delete this news story?'))return;const s=createClient() as any;const {error}=await s.from('news_posts').delete().eq('id',id);if(error)setMessage(error.message);else await load()}
 if(allowed===false)return <main className="min-h-dvh"><Navbar/><section className="mx-auto max-w-xl px-4 py-16 text-center"><h1 className="text-2xl font-black">Admin access required</h1><p className="mt-2 text-sm text-[var(--fx-muted)]">Only FeniX Admin can publish News.</p><Link href="/admin" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--fx-primary-strong)] px-4 text-xs font-bold text-white"><ArrowLeft size={15}/> Admin Center</Link></section></main>
 return <main className="fenix-shell min-h-dvh"><Navbar/><section className="mx-auto max-w-7xl px-4 pb-28 pt-7 sm:px-6 lg:px-8">
  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><Link href="/admin" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--fx-border)] px-3.5 text-xs font-bold"><ArrowLeft size={15}/> Admin Center</Link><div className="mt-5 flex items-center gap-2 text-[var(--fx-primary-strong)]"><Newspaper size={20}/><span className="text-[10px] font-black uppercase tracking-[.18em]">FeniX News Control</span></div><h1 className="mt-2 text-4xl font-black tracking-[-.055em] sm:text-6xl">Run the newsroom.</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--fx-muted)]">Create, review, publish, unpublish and correct public FeniX News. No outside user can publish directly.</p></div><Link href="/news" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--fx-primary-soft)] px-4 text-xs font-bold text-[var(--fx-primary-strong)]">Open public News</Link></div>
  {message&&<div className="mt-5 rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-surface)] p-4 text-xs leading-6">{message}</div>}
  <div className="mt-7 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
   <section className="rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5 sm:p-7">
    <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-black">{editing?'Edit story':'New story'}</h2>{editing&&<button type="button" onClick={()=>{setEditing(null);setForm({...empty})}} className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--fx-border)]"><X size={17}/></button>}</div>
    <div className="mt-5 grid gap-4 sm:grid-cols-2">
      <Field label="English title"><input value={form.title_en} onChange={e=>patch('title_en',e.target.value)} className="w-full rounded-xl border border-[var(--fx-border)] bg-[var(--fx-bg)] px-3.5 py-3 text-sm outline-none focus:border-[var(--fx-primary)]/40" /></Field>
      <Field label="Bangla title"><input value={form.title_bn} onChange={e=>patch('title_bn',e.target.value)} className="w-full rounded-xl border border-[var(--fx-border)] bg-[var(--fx-bg)] px-3.5 py-3 text-sm outline-none focus:border-[var(--fx-primary)]/40" /></Field>
      <Field label="Slug"><input value={form.slug} onChange={e=>patch('slug',e.target.value)} className="w-full rounded-xl border border-[var(--fx-border)] bg-[var(--fx-bg)] px-3.5 py-3 text-sm outline-none focus:border-[var(--fx-primary)]/40" placeholder="story-slug" /></Field>
      <Field label="Category"><select value={form.category} onChange={e=>patch('category',e.target.value)} className="w-full rounded-xl border border-[var(--fx-border)] bg-[var(--fx-bg)] px-3.5 py-3 text-sm outline-none focus:border-[var(--fx-primary)]/40">{cats.map(c=><option key={c[0]} value={c[0]}>{c[1]}</option>)}</select></Field>
      <Field label="Status"><select value={form.status} onChange={e=>patch('status',e.target.value)} className="w-full rounded-xl border border-[var(--fx-border)] bg-[var(--fx-bg)] px-3.5 py-3 text-sm outline-none focus:border-[var(--fx-primary)]/40"><option value="draft">Draft</option><option value="review">Review</option><option value="published">Published</option><option value="archived">Archived</option></select></Field>
      <Field label="Verification"><select value={form.verification_status} onChange={e=>patch('verification_status',e.target.value)} className="w-full rounded-xl border border-[var(--fx-border)] bg-[var(--fx-bg)] px-3.5 py-3 text-sm outline-none focus:border-[var(--fx-primary)]/40"><option value="official_source">Official source</option><option value="editor_reviewed">Editor reviewed</option><option value="reported">Reported</option><option value="unverified">Unverified</option></select></Field>
      <Field label="Source name"><input value={form.source_name||''} onChange={e=>patch('source_name',e.target.value)} className="w-full rounded-xl border border-[var(--fx-border)] bg-[var(--fx-bg)] px-3.5 py-3 text-sm outline-none focus:border-[var(--fx-primary)]/40" /></Field>
      <Field label="Source URL"><input value={form.source_url||''} onChange={e=>patch('source_url',e.target.value)} className="w-full rounded-xl border border-[var(--fx-border)] bg-[var(--fx-bg)] px-3.5 py-3 text-sm outline-none focus:border-[var(--fx-primary)]/40" placeholder="https://..." /></Field>
      <Field label="Excerpt (English)"><textarea value={form.excerpt_en||''} onChange={e=>patch('excerpt_en',e.target.value)} rows={3} className="w-full rounded-xl border border-[var(--fx-border)] bg-[var(--fx-bg)] px-3.5 py-3 text-sm outline-none focus:border-[var(--fx-primary)]/40" /></Field>
      <Field label="Excerpt (Bangla)"><textarea value={form.excerpt_bn||''} onChange={e=>patch('excerpt_bn',e.target.value)} rows={3} className="w-full rounded-xl border border-[var(--fx-border)] bg-[var(--fx-bg)] px-3.5 py-3 text-sm outline-none focus:border-[var(--fx-primary)]/40" /></Field>
      <Field label="Article (English)"><textarea value={form.content_en} onChange={e=>patch('content_en',e.target.value)} rows={12} className="input sm:col-span-2" /></Field>
      <Field label="Article (Bangla)"><textarea value={form.content_bn} onChange={e=>patch('content_bn',e.target.value)} rows={12} className="input sm:col-span-2" /></Field>
    </div>
    <div className="mt-4 flex flex-wrap gap-4 text-xs font-bold"><label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.featured} onChange={e=>patch('featured',e.target.checked)}/> Featured</label><label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.breaking} onChange={e=>patch('breaking',e.target.checked)}/> Breaking</label></div>
    <button type="button" disabled={busy} onClick={()=>void save()} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--fx-primary-strong)] px-5 text-sm font-bold text-white disabled:opacity-50"><FloppyDisk size={17}/>{busy?'Saving…':form.status==='published'?'Publish to public News':'Save story'}</button>
   </section>
   <section><div className="flex items-end justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[var(--fx-primary-strong)]">Stories</p><h2 className="mt-1 text-xl font-black">{posts.length} total</h2></div><button type="button" onClick={()=>start()} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--fx-border)] px-3 text-xs font-bold"><Plus size={15}/> New</button></div>
    <div className="mt-4 space-y-2">{posts.map(p=><div key={p.id} className="rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-surface)] p-4"><div className="flex items-start gap-3"><div className="min-w-0 flex-1"><div className="flex flex-wrap gap-2 text-[9px] font-black uppercase tracking-[.1em]"><span className="rounded-full bg-[var(--fx-primary-soft)] px-2 py-1">{p.status}</span><span className="rounded-full border border-[var(--fx-border)] px-2 py-1">{p.category}</span></div><p className="mt-3 font-bold">{p.title_en}</p><p className="mt-1 text-[11px] text-[var(--fx-muted)]">{p.published_at?new Date(p.published_at).toLocaleString('en-BD'):'Not public'}</p></div><div className="flex gap-1"><button type="button" onClick={()=>start(p)} className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--fx-border)]"><PencilSimple size={15}/></button><button type="button" onClick={()=>void remove(p.id)} className="grid h-9 w-9 place-items-center rounded-lg border border-red-500/15 text-red-600"><Trash size={15}/></button></div></div></div>)}</div>
   </section>
  </div>
 </section></main>
}
function Field({label,children}:{label:string;children:React.ReactNode}){return <label className="block text-xs font-bold"><span className="mb-1.5 block text-[var(--fx-muted)]">{label}</span>{children}</label>}
