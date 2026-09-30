'use client'

import Link from 'next/link'
import { use, useCallback, useEffect, useState } from 'react'
import { ArrowLeft, BookmarkSimple, PaperPlaneRight, ShareNetwork, ThumbsUp, UserCircle } from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import FenixRouteSkeleton from '@/components/loading/FenixRouteSkeleton'
import { createClient } from '@/utils/supabase/client'
import { useFenixLocale } from '@/components/i18n/FenixLocaleProvider'

type Answer={id:string;body:string;created_at:string;updated_at:string;author_id:string;author_name:string|null;author_username:string|null;author_avatar_url:string|null;score:number}
type Question={id:string;title:string;body:string;created_at:string;author_id:string;author_name:string|null;author_username:string|null;author_avatar_url:string|null;topic_id:string|null;topic_name:string|null}
type Comment={id:string;author_id:string;body:string;created_at:string;author_name:string|null;author_username:string|null;author_avatar_url:string|null}

export default function QuestionPage({params}:{params:Promise<{id:string}>}){
 const {id}=use(params)
 const {locale}=useFenixLocale()
 const [q,setQ]=useState<Question|null>(null)
 const [answers,setAnswers]=useState<Answer[]>([])
 const [comments,setComments]=useState<Comment[]>([])
 const [userId,setUserId]=useState<string|null>(null)
 const [body,setBody]=useState('')
 const [commentBody,setCommentBody]=useState('')
 const [busy,setBusy]=useState(false)
 const [loading,setLoading]=useState(true)
 const [saved,setSaved]=useState(false)
 const [message,setMessage]=useState('')

 const load=useCallback(async()=>{
   setLoading(true)
   const s=createClient()
   try{
     const [{data:auth},{data:qv},{data:av},{data:cv}]=await Promise.all([
       s.auth.getSession(),
       s.from('fenix_public_question_feed').select('id,title,body,created_at,author_id,topic_id,author_name,author_username,author_avatar_url,topic_name_bn,topic_name_en').eq('id',id).maybeSingle(),
       s.from('fenix_public_answer_feed').select('id,question_id,body,created_at,updated_at,author_id,author_name,author_username,author_avatar_url,score').eq('question_id',id).order('created_at',{ascending:true}).limit(100),
       s.from('fenix_content_comments').select('id,author_id,body,created_at').eq('content_type','question').eq('content_id',id).order('created_at',{ascending:true}).limit(100),
     ])
     const uid=auth.session?.user?.id??null
     setUserId(uid)
     if(qv){
       const row=qv as unknown as Record<string,unknown>
       setQ({
         ...qv,
         topic_name:locale==='bn'
           ? (String(row.topic_name_bn??'')||String(row.topic_name_en??''))
           : (String(row.topic_name_en??'')||String(row.topic_name_bn??'')),
       } as Question)
     }else setQ(null)
     setAnswers((av??[]) as Answer[])

     const commentRows=(cv??[]) as Array<{id:string;author_id:string;body:string;created_at:string}>
     if(commentRows.length){
       const ids=Array.from(new Set(commentRows.map(x=>x.author_id)))
       const {data:profiles}=await s.from('fenix_public_profiles').select('id,full_name,username,avatar_url').in('id',ids)
       const byId=Object.fromEntries(((profiles??[]) as Array<{id:string;full_name:string|null;username:string|null;avatar_url:string|null}>).map(p=>[p.id,p]))
       setComments(commentRows.map(row=>({
         ...row,
         author_name:byId[row.author_id]?.full_name??null,
         author_username:byId[row.author_id]?.username??null,
         author_avatar_url:byId[row.author_id]?.avatar_url??null,
       })))
     }else setComments([])

     if(uid){
       const {data:bookmark}=await s.from('fenix_content_bookmarks').select('content_id').eq('user_id',uid).eq('content_type','question').eq('content_id',id).maybeSingle()
       setSaved(Boolean(bookmark))
     }else setSaved(false)
   }catch{
     setMessage(locale==='bn'?'Question লোড করা যায়নি।':'Could not load this question.')
   }finally{
     setLoading(false)
   }
 },[id,locale])

 useEffect(()=>{void load()},[load])

 async function answer(){
   if(!userId||!body.trim())return
   setBusy(true);setMessage('')
   const s=createClient()
   const {error}=await s.from('fenix_answers').insert({question_id:id,author_id:userId,body:body.trim()})
   if(error)setMessage(locale==='bn'?'উত্তর দেওয়া যায়নি।':'Could not publish answer.')
   else{setBody('');setMessage(locale==='bn'?'উত্তর প্রকাশ হয়েছে।':'Answer published.');await load()}
   setBusy(false)
 }

 async function vote(answerId:string){
   if(!userId){setMessage(locale==='bn'?'Vote দিতে Login করুন।':'Sign in to vote.');return}
   const s=createClient()
   const {data:old}=await s.from('fenix_content_votes').select('value').eq('user_id',userId).eq('content_type','answer').eq('content_id',answerId).maybeSingle()
   const result=old
     ? await s.from('fenix_content_votes').delete().eq('user_id',userId).eq('content_type','answer').eq('content_id',answerId)
     : await s.from('fenix_content_votes').insert({user_id:userId,content_type:'answer',content_id:answerId,value:1})
   if(result.error){setMessage(locale==='bn'?'Vote আপডেট করা যায়নি।':'Could not update vote.');return}
   setAnswers(value=>value.map(a=>a.id===answerId?{...a,score:Math.max(0,a.score+(old?-1:1))}:a))
 }

 async function toggleBookmark(){
   if(!userId){setMessage(locale==='bn'?'Save করতে Login করুন।':'Sign in to save this question.');return}
   const s=createClient()
   const result=saved
     ? await s.from('fenix_content_bookmarks').delete().eq('user_id',userId).eq('content_type','question').eq('content_id',id)
     : await s.from('fenix_content_bookmarks').insert({user_id:userId,content_type:'question',content_id:id})
   if(result.error){setMessage(locale==='bn'?'Save আপডেট করা যায়নি।':'Could not update save state.');return}
   setSaved(!saved)
 }

 async function addComment(){
   const clean=commentBody.trim()
   if(!userId||!clean)return
   setBusy(true);setMessage('')
   const s=createClient()
   const {data,error}=await s.from('fenix_content_comments').insert({author_id:userId,content_type:'question',content_id:id,body:clean}).select('id,author_id,body,created_at').maybeSingle()
   if(error||!data){setMessage(locale==='bn'?'Comment যোগ করা যায়নি।':'Could not add comment.');setBusy(false);return}
   const {data:profile}=await s.from('fenix_public_profiles').select('id,full_name,username,avatar_url').eq('id',userId).maybeSingle()
   setComments(value=>[...value,{
     ...data,
     author_name:profile?.full_name??null,
     author_username:profile?.username??null,
     author_avatar_url:profile?.avatar_url??null,
   } as Comment])
   setCommentBody('');setBusy(false)
 }

 if(loading)return <FenixRouteSkeleton variant="article" />
 if(!q)return <main className="min-h-dvh"><Navbar/><section className="mx-auto max-w-3xl px-4 py-10"><Link href="/feed" className="font-bold">← Feed</Link><p className="mt-8 text-sm text-[var(--fx-muted)]">{message|| (locale==='bn'?'Question পাওয়া যায়নি।':'Question not found.')}</p></section></main>

 return <main className="min-h-dvh"><Navbar/><section className="mx-auto max-w-3xl px-4 pb-28 pt-7 sm:px-6">
  <Link href="/feed" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--fx-border)] px-3.5 text-xs font-bold"><ArrowLeft size={16}/> Feed</Link>
  {message&&<p className="mt-3 rounded-xl bg-[var(--fx-primary-soft)] p-3 text-xs">{message}</p>}
  <article className="mt-5 rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5 sm:p-7">
   <div className="flex items-center gap-3">{q.author_avatar_url?<img src={q.author_avatar_url} alt="" loading="lazy" decoding="async" width={40} height={40} className="h-10 w-10 rounded-full object-cover"/>:<UserCircle size={40} className="opacity-40"/>}<div><p className="text-sm font-bold">{q.author_name||q.author_username||'FeniX user'}</p><time className="text-[11px] text-[var(--fx-muted)]">{new Date(q.created_at).toLocaleString(locale==='bn'?'bn-BD':'en-BD')}</time></div></div>
   <h1 className="mt-5 text-2xl font-black leading-9 sm:text-4xl">{q.title}</h1>
   {q.topic_name&&<p className="mt-2 text-xs font-bold text-[var(--fx-primary-strong)]">{q.topic_name}</p>}
   <p className="mt-5 whitespace-pre-wrap text-sm leading-8">{q.body}</p>
   <div className="mt-5 flex flex-wrap gap-2">
    <button onClick={()=>void navigator.share?.({title:q.title,url:location.href})} className="rounded-xl border border-[var(--fx-border)] px-3 py-2 text-xs font-bold"><ShareNetwork size={15} className="mr-1 inline"/>Share</button>
    <button onClick={()=>void toggleBookmark()} className={`rounded-xl border px-3 py-2 text-xs font-bold ${saved?'border-[var(--fx-primary)]/20 bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]':'border-[var(--fx-border)]'}`}><BookmarkSimple size={15} className="mr-1 inline"/>{saved?(locale==='bn'?'Saved':'Saved'):(locale==='bn'?'Save':'Save')}</button>
   </div>
  </article>

  <section className="mt-5">
   <h2 className="text-xl font-black">{locale==='bn'?'উত্তর':'Answers'} ({answers.length})</h2>
   {userId?<div className="mt-3 rounded-[1.7rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-4"><textarea value={body} onChange={e=>setBody(e.target.value)} rows={5} maxLength={20000} placeholder={locale==='bn'?'আপনার উত্তর লিখুন…':'Write your answer…'} className="w-full rounded-xl border border-[var(--fx-border)] bg-transparent p-3 text-sm leading-7"/><button disabled={busy||!body.trim()} onClick={()=>void answer()} className="mt-2 ml-auto block rounded-xl bg-[var(--fx-primary-strong)] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-40"><PaperPlaneRight size={15} className="mr-1 inline"/>{locale==='bn'?'উত্তর দিন':'Answer'}</button></div>:<Link href={`/login?next=/feed/question/${id}`} className="mt-3 block rounded-2xl bg-[var(--fx-primary-soft)] p-4 text-center text-sm font-bold text-[var(--fx-primary-strong)]">{locale==='bn'?'উত্তর দিতে Login করুন':'Sign in to answer'}</Link>}
   <div className="mt-4 space-y-3">{answers.map(a=><article key={a.id} className="rounded-[1.7rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5"><div className="flex items-center gap-3">{a.author_avatar_url?<img src={a.author_avatar_url} alt="" loading="lazy" decoding="async" width={36} height={36} className="h-9 w-9 rounded-full object-cover"/>:<UserCircle size={36} className="opacity-40"/>}<div><p className="text-sm font-bold">{a.author_name||a.author_username||'FeniX user'}</p><time className="text-[11px] text-[var(--fx-muted)]">{new Date(a.created_at).toLocaleString(locale==='bn'?'bn-BD':'en-BD')}</time></div></div><p className="mt-3 whitespace-pre-wrap text-sm leading-7">{a.body}</p><button onClick={()=>void vote(a.id)} className="mt-3 rounded-xl border border-[var(--fx-border)] px-3 py-2 text-xs font-bold"><ThumbsUp size={15} className="mr-1 inline"/>Helpful · {a.score}</button></article>)}</div>
  </section>

  <section className="mt-7">
   <h2 className="text-xl font-black">{locale==='bn'?'Comments':'Comments'} ({comments.length})</h2>
   {userId&&<div className="mt-3 rounded-[1.7rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-4"><textarea value={commentBody} onChange={e=>setCommentBody(e.target.value)} rows={3} maxLength={3000} placeholder={locale==='bn'?'মন্তব্য লিখুন…':'Write a comment…'} className="w-full rounded-xl border border-[var(--fx-border)] bg-transparent p-3 text-sm leading-7"/><button disabled={busy||!commentBody.trim()} onClick={()=>void addComment()} className="mt-2 ml-auto block rounded-xl bg-[var(--fx-primary-strong)] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-40">{locale==='bn'?'Comment দিন':'Comment'}</button></div>}
   <div className="mt-3 space-y-2">{comments.map(comment=><article key={comment.id} className="rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-surface)] p-4"><div className="flex items-center gap-2">{comment.author_avatar_url?<img src={comment.author_avatar_url} alt="" loading="lazy" decoding="async" width={32} height={32} className="h-8 w-8 rounded-full object-cover"/>:<UserCircle size={32} className="opacity-40"/>}<div><p className="text-xs font-bold">{comment.author_name||comment.author_username||'FeniX user'}</p><time className="text-[10px] text-[var(--fx-muted)]">{new Date(comment.created_at).toLocaleString(locale==='bn'?'bn-BD':'en-BD')}</time></div></div><p className="mt-2 whitespace-pre-wrap text-sm leading-6">{comment.body}</p></article>)}</div>
  </section>
 </section></main>
}
